import assert from "assert";
import {ALLOWED_VERSIONS} from "./constants/versions";

type SequenceList = { [key: string]: string[] }
export type NDCJSON = { [key: string]: string | {} | [] }

export class JSON2XMLConverter {
    private xml = '';
    private debug = false;
    private readonly sequences: SequenceList = {};

    constructor(version: string, debug?: boolean) {
        assert(ALLOWED_VERSIONS.indexOf(version) !== -1, 'Unsupported version');
        this.sequences = require(`./sequences/sequences-${version}`);
        this.debug = debug || false;
    }

    setDebug(isDebug?: boolean) {
        this.debug = isDebug || false;
    }

    /**
     * Performs an NDC-compliant json to an NDC-compliant xml conversion
     * @param {NDCJSON} json
     * @return {string|number} -1 if fail
     */
    convertToXML(json: NDCJSON): string | number {
        const rootElementKey = Object.keys(json)[0];
        this.convert(json[rootElementKey], rootElementKey, '');
        return this.xml;
    }

    convert(obj: {} | Array<{}>, key: string, xpath: string) {
        // loop over array values
        if (Array.isArray(obj)) {
            for (const el of obj) {
                this.sub_convert(key, el, xpath + key + '/');
            }
        } else {
            this.sub_convert(key, obj, xpath + key + '/');
        }
    }

    sub_convert(key: string, el: { [key: string]: any }, xpath: string) {
        // opening el
        for (let i = 0; i < (xpath.match(/\//g) || []).length - 1; i++) {
            this.xml += '\t';
        }
        this.xml += '<' + key; // attributes
        if (el === null) { // short form of an empty element
            this.xml += ' />\n';
            return;
        }
        // attributes
        if ('$' in el) {
            for (const attr in el.$) {
                this.xml += ' ' + attr + '="' + el.$[attr] + '"';
            }
        }
        this.xml += '>';
        // value
        if ('_' in el) {
            this.xml += el._
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\"/g, '"');
        } else if ((Object.keys(el).length == 1 && '$' in el) || Object.keys(el).length == 0) {
            // attributes or not, but no value and no children
        } else { // children
            this.xml += '\n';
            let unorderedKeys = Object.keys(el)
                .filter(key => key !== "$" && key !== "_"); // do not process attributes and value
            // SORTING KEYS
            let keys = [];
            let sequence: string[];
            try {
                sequence = this.sequences[xpath];
                for (const e of sequence) {
                    if (unorderedKeys.indexOf(e) > -1) {
                        keys.push(e);
                    }
                }
                if (unorderedKeys.length != keys.length) { // missing keys in sequence
                    if (this.debug) console.log('Sequence incomplete for ' + xpath);
                    keys = unorderedKeys; // keep all keys, still unordered
                }
            } catch (err) { // no sequence for xpath
                if (this.debug) console.log('No sequence found for ' + xpath);
                keys = unorderedKeys;
            }
            // KEYS SORTED
            for (const k of keys) {
                // do not process attributes and value
                if (k != '$' && k != '_') {
                    this.convert(el[k], k, xpath);
                }
            }
            for (var i = 0; i < (xpath.match(/\//g) || []).length - 1; i++) {
                this.xml += '\t';
            }
        }
        // closing element
        this.xml += '</' + key + '>\n';
    }
}
