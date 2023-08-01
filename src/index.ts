import {JSON2XMLConverter, NDCJSON} from "./JSON2XMLConverter";

/**
 * Takes an input JSON and converts it to a NDC-compatible XML payload.
 * Note that input JSON should also be NDC-compatible with a particular NDC version.
 *
 * @param {{}} inputJSON - valid JSON object
 * @param {string} version - allowed are 162, 171, 172, 181, 182, 191, 192
 * @param {boolean} debug, optional debug flag
 */
const json2xml = (inputJSON: NDCJSON, version: string, debug?: boolean): string | number => {
    try {
        const converter = new JSON2XMLConverter(version, debug);
        return converter.convertToXML(inputJSON);
    } catch (e) {
        console.error('Error converting NDC json to xml\n' + e.stack);
        return -1;
    }
}

module.exports = json2xml
