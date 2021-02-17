const assert = require('assert'),
    fs = require('fs')

type SequenceList = { [key: string]: string[] }

const {ALLOWED_VERSIONS} = require('./constants/versions.ts'),
    sequencesDir = './src/sequences/'

let debug = false
let sequences: SequenceList
let json: { [key: string]: string | {} | [] }
let xml = ''

function setDebug(isDebug?: boolean) {
    debug = isDebug || false;
}

function checkVersion(version: string) {
    assert(ALLOWED_VERSIONS.indexOf(version) !== -1, 'Unsupported version');
}

async function loadScheme(version: string): Promise<SequenceList | string> {
    return new Promise((resolve, reject) => {
        fs.readFile(
            `${sequencesDir}sequences-${version}.json`,
            'utf8',
            function (err: NodeJS.ErrnoException | null, data: string) {
                if (err) {
                    reject('Error reading sequences.json\n' + err.stack)
                } else {
                    resolve(JSON.parse(data));
                }
            });
    })
}

async function loadInputFile(filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', function (err: NodeJS.ErrnoException | null, data: string) {
            if (err) {
                reject('Error reading input file\n' + err.stack)
            } else {
                resolve(data)
            }
        });
    })
}

/**
 * Performs an NDC-compliant json to an NDC-compliant xml conversion
 * @param {string} jsonData
 * @return {string|number} -1 if fail
 */
function convert(jsonData: string): string | number {
    try {
        json = JSON.parse(jsonData);
    } catch (err) {
        console.error('Invalid JSON input\n' + err);
        return -1;
    }

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
 * Takes an input JSON file by given path and converts it to a NDC-compatible XML payload.
 * Note tha input JSON should also be NDC-compatible with a particular NDC version.
 *
 * @param {string} inputFilePath
 * @param {string} version - allowed are 162, 171, 172, 181, 182, 191, 192
 * @param {boolean} debug, optional debug flag
 */
export default async (inputFilePath: string, version: string, debug?: boolean): Promise<string | number> => {
    setDebug(debug);

    try {
        checkVersion(version);
        sequences = sequences || await loadScheme(version);
        const inputJSON = await loadInputFile(inputFilePath);
        return convert(inputJSON);
    } catch (e) {
        console.error('Error converting NDC json to xml\n' + e);
        return -1;
    }
};