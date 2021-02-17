# NDC compliant JSON to XML converter

This module wrapper for NDC json2xml allows you to convert and NDC-compliant JSON payload into a equivalent NDC XML payload. 
The converter code is originally made by @airtechzone ([https://github.com/airtechzone/ndc-json2xml-js]).

# Versions supported

Currently following NDC versions are supported: 16.2, 17.1, 17.2, 18.1, 18.2, 19.1, 19.2.

# Usage

To install the module use npm install:
```
npm i ndc-json2xml
```

```javascript
import json2xml from 'json2xml'
```

To use the module provide either a file with NDC JSON or parsed JSON and get generated XML back in a Promise:

```javascript
const version = "182" // NDC v18.2
const xml = await json2xml('.some-json-input-182.json', version);
```

or

```javascript
const version = "182" // NDC v18.2
const xml = await json2xml({
    "IATA_AirShoppingRQ": {
        "$": {}
    }}, version);
```