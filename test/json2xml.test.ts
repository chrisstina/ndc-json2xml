import json2xml from '../src';

describe('json 2 xml converter', () => {
    it('converts JSON to XML for NDC-18.2 version', async () => {
        const xml = await json2xml('./test/input/182.json', "182");
        console.log(xml)
        expect(xml).not.toEqual(-1)
        expect(xml).not.toContain('undefined');
        expect(xml).toContain("IATA_AirShoppingRQ");
    });

    it('fails to convert JSON to XML for empty file', async () => {
        try {
            await json2xml('./test/input/empty.json', "182")
        } catch (e) {
            expect(e).toEqual(-1)
        }
    });
});
