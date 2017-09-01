const expect = require('expect');
const EncodeUtils = require('../EncodeUtils');

const json = {
	"name": "Hillshade 2.5m  digitales Gelände- und Oberflächenmodell - Modello digitale del terreno e della superficie - Digital Terrain and Surface Model"
};

describe('EncodeUtils', () => {
    it('check utf encoding of chars with hex sequences', () => {
        const encoded = EncodeUtils.utfEncode(JSON.stringify(json));

        expect(encoded.indexOf('\\u00E4') !== -1).toBe(true);
    });
});
