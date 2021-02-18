import fs from 'fs'

const json2xml = require('../src')

describe('json 2 xml converter', () => {
    it('converts JSON to XML for NDC-18.2 version', () => {
        const json = JSON.parse(
            fs.readFileSync('./test/input/182.json').toString()
        )
        const xml = json2xml(json, '182')
        expect(xml).not.toEqual(-1)
        expect(xml).not.toContain('undefined')
        expect(xml).toContain('IATA_AirShoppingRQ')
    })

    it('fails to convert JSON to XML for empty JSON', () => {
        try {
            json2xml({}, '182')
        } catch (e) {
            expect(e).toEqual(-1)
        }
    })
})
