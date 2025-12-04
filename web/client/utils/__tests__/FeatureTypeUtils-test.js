import expect from 'expect';
import {describeFeatureTypeToAttributes} from '../FeatureTypeUtils';

describe('Test the FeatureTypeUtils', () => {
    const data1 = {
        featureTypes: [{
            properties: [{
                name: "name",
                type: "xsd:string"
            }]
        }]
    };
    it('describeFeatureTypeToAttributes', () => {

        const fields = [{
            name: "name",
            alias: "alias"
        }];
        const attributes = describeFeatureTypeToAttributes(data1, fields);
        expect(attributes).toEqual([{
            label: "alias",
            attribute: "name",
            type: "string",
            valueId: "id",
            valueLabel: "name",
            values: []
        }]);
    });
    it('describeFeatureTypeToAttributes with no fields', () => {
        const attributes = describeFeatureTypeToAttributes(data1);
        expect(attributes).toEqual([{
            label: "name",
            attribute: "name",
            type: "string",
            valueId: "id",
            valueLabel: "name",
            values: []
        }]);
    });
    it('describeFeatureTypeToAttributes with empty default string', () => {
        const attributes = describeFeatureTypeToAttributes(data1, [{
            name: "name",
            alias: {
                "default": "",
                "it-IT": "test"
            }
        }]);
        expect(attributes).toEqual([{
            label: {"default": "name",
                "it-IT": "test"},
            attribute: "name",
            type: "string",
            valueId: "id",
            valueLabel: "name",
            values: []
        }]);
    });
    it('describeFeatureTypeToAttributes with multi-geometry fields', () => {
        const featureTypeData = {
            featureTypes: [{
                properties: [{
                    name: "name",
                    type: "xsd:string"
                }, {
                    "name": "the_geom",
                    "maxOccurs": 1,
                    "minOccurs": 0,
                    "nillable": true,
                    "type": "gml:Point",
                    "localType": "Point"
                }, {
                    "name": "geom2",
                    "maxOccurs": 1,
                    "minOccurs": 0,
                    "nillable": true,
                    "type": "xsd:LineString",
                    "localType": "LineString"
                }, {
                    "name": "geom3",
                    "maxOccurs": 1,
                    "minOccurs": 0,
                    "nillable": true,
                    "type": "xsd:Point",
                    "localType": "Point"
                }]
            }]
        };
        const fields = [
            {
                name: "name",
                alias: "alias"
            },
            {
                name: "the_geom",
                alias: "Point"
            },
            {
                name: "geom2",
                alias: "LineString"
            },
            {
                name: "geom3",
                alias: "Point"
            }
        ];
        const attributes = describeFeatureTypeToAttributes(featureTypeData, fields);
        expect(attributes).toEqual([{
            label: "alias",
            attribute: "name",
            type: "string",
            valueId: "id",
            valueLabel: "name",
            values: []
        }]);
    });
});
