import assert from "assert"
import {ALLOWED_VERSIONS} from "./constants/versions"

type SequenceList = { [key: string]: string[] }
type NDCJSON = { [key: string]: string | {} | [] }

let debug = false
let sequences: SequenceList
let xml = ''

function setDebug(isDebug?: boolean) {
    debug = isDebug || false;
}

function checkVersion(version: string) {
    assert(ALLOWED_VERSIONS.indexOf(version) !== -1, 'Unsupported version');
}

/**
 * Performs an NDC-compliant json to an NDC-compliant xml conversion
 * @param {NDCJSON} json
 * @return {string|number} -1 if fail
 */
function convert(json: NDCJSON): string | number {
    const rootElementKey = Object.keys(json)[0];
    parse(json[rootElementKey], rootElementKey, '');

    return xml;
}

function parse(obj: {} | Array<{}>, key: string, xpath: string) {
    // loop over array values
    if (Array.isArray(obj)) {
        for (const el of obj) {
            sub_parse(key, el, xpath + key + '/');
        }
    } else {
        sub_parse(key, obj, xpath + key + '/');
    }
}


function sub_parse(key: string, el: { [key: string]: any }, xpath: string) {
    // opening el
    for (let i = 0; i < (xpath.match(/\//g) || []).length - 1; i++) {
        xml += '\t';
    }
    xml += '<' + key;
    // attributes
    if ('$' in el) {
        for (const attr in el.$) {
            xml += ' ' + attr + '="' + el.$[attr] + '"';
        }
    }
    xml += '>';
    // value
    if ('_' in el) {
        xml += el._
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"');
    } else if ((Object.keys(el).length == 1 && '$' in el) || Object.keys(el).length == 0) {
        // attributes or not, but no value and no children
    } else { // children
        xml += '\n';
        let unorderedKeys = Object.keys(el);
        // SORTING KEYS
        let keys = [];
        let sequence: string[];
        try {
            sequence = sequences[xpath];
            for (const e of sequence) {
                if (unorderedKeys.indexOf(e) > -1) {
                    keys.push(e);
                }
            }
            if (unorderedKeys.length != keys.length) { // missing keys in sequence
                if (debug) console.log('Sequence incomplete for ' + xpath);
                keys = unorderedKeys; // keep all keys, still unordered
            }
        } catch (err) { // no sequence for xpath
            if (debug) console.log('No sequence found for ' + xpath);
            keys = unorderedKeys;
        }
        // KEYS SORTED
        for (const k of keys) {
            // do not process attributes and value
            if (k != '$' && k != '_') {
                parse(el[k], k, xpath);
            }
        }
        for (var i = 0; i < (xpath.match(/\//g) || []).length - 1; i++) {
            xml += '\t';
        }
    }
    // closing element
    xml += '</' + key + '>\n';
}

/**
 * Takes an input JSON and converts it to a NDC-compatible XML payload.
 * Note that input JSON should also be NDC-compatible with a particular NDC version.
 *
 * @param {{}} inputJSON - valid JSON object
 * @param {string} version - allowed are 162, 171, 172, 181, 182, 191, 192
 * @param {boolean} debug, optional debug flag
 */
const json2xml = (inputJSON: NDCJSON, version: string, debug?: boolean): string | number => {
    xml = ''
    setDebug(debug)
    try {
        checkVersion(version);
        sequences = sequences || require(`./sequences/sequences-${version}`)
        return convert(inputJSON);
    } catch (e) {
        console.error('Error converting NDC json to xml\n' + e.stack);
        return -1;
    }
}

module.exports = json2xml