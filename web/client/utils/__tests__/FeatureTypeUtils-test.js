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
});
