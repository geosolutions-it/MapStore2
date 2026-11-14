import expect from 'expect';
import {describeFeatureTypeToAttributes, describeFeatureTypeToSchema, isGeometryPropertyType} from '../FeatureTypeUtils';
import {DEFAULT_SCHEMA_SRS} from '../FeatureSchemaUtils';
import describePois from '../../test-resources/wfs/describe-pois.json';

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
    it('isGeometryPropertyType', () => {
        expect(isGeometryPropertyType('gml:Point')).toBe(true);
        expect(isGeometryPropertyType('xsd:Geometry')).toBe(true);
        expect(isGeometryPropertyType('xsd:MultiPolygon')).toBe(true);
        expect(isGeometryPropertyType('xsd:string')).toBe(false);
        expect(isGeometryPropertyType()).toBe(false);
    });
    it('describeFeatureTypeToSchema', () => {
        const schema = describeFeatureTypeToSchema(describePois);
        expect(schema.typeName).toBe('tiger:poi');
        expect(schema.srs).toBe(DEFAULT_SCHEMA_SRS);
        expect(schema.geometryAttribute).toBe('the_geom');
        expect(schema.geometryType).toBe('Point');
        expect(schema.attributes.map(({name}) => name)).toEqual(['the_geom', 'NAME', 'THUMBNAIL', 'MAINPAGE']);
        expect(schema.attributes[0]).toEqual({
            name: 'the_geom',
            label: 'the_geom',
            type: 'geometry',
            localType: 'Point',
            nillable: true,
            minOccurs: 0,
            maxOccurs: 1,
            geometry: true
        });
        expect(schema.attributes[1]).toEqual({
            name: 'NAME',
            label: 'NAME',
            type: 'string',
            localType: 'string',
            nillable: true,
            minOccurs: 0,
            maxOccurs: 1,
            geometry: false
        });
    });
    it('describeFeatureTypeToSchema keeps properties with an unmapped type', () => {
        const schema = describeFeatureTypeToSchema({
            featureTypes: [{
                properties: [{
                    name: 'name',
                    type: 'xsd:string',
                    localType: 'string'
                }, {
                    name: 'link',
                    type: 'xsd:anyURI',
                    localType: 'anyURI'
                }]
            }]
        });
        expect(schema.attributes.map(({name}) => name)).toEqual(['name', 'link']);
        expect(schema.attributes[1].type).toBe(undefined);
        expect(schema.attributes[1].localType).toBe('anyURI');
    });
    it('describeFeatureTypeToSchema with fields alias', () => {
        const schema = describeFeatureTypeToSchema(data1, [{
            name: 'name',
            alias: 'alias'
        }]);
        expect(schema.attributes[0].label).toBe('alias');
    });
    it('describeFeatureTypeToSchema with localized fields alias', () => {
        const schema = describeFeatureTypeToSchema(data1, [{
            name: 'name',
            alias: {
                'default': '',
                'it-IT': 'test'
            }
        }]);
        expect(schema.attributes[0].label).toEqual({
            'default': 'name',
            'it-IT': 'test'
        });
    });
    it('describeFeatureTypeToSchema with multi-geometry fields', () => {
        const schema = describeFeatureTypeToSchema({
            featureTypes: [{
                properties: [{
                    name: 'name',
                    type: 'xsd:string'
                }, {
                    name: 'the_geom',
                    type: 'gml:Point',
                    localType: 'Point'
                }, {
                    name: 'geom2',
                    type: 'xsd:LineString',
                    localType: 'LineString'
                }]
            }]
        });
        expect(schema.attributes.map(({geometry}) => geometry)).toEqual([false, true, true]);
        expect(schema.geometryAttribute).toBe('the_geom');
        expect(schema.geometryType).toBe('Point');
    });
    it('describeFeatureTypeToSchema with no geometry', () => {
        const schema = describeFeatureTypeToSchema(data1);
        expect(schema.geometryAttribute).toBe(undefined);
        expect(schema.geometryType).toBe(undefined);
    });
    it('describeFeatureTypeToSchema with empty data', () => {
        expect(describeFeatureTypeToSchema()).toEqual({
            attributes: [],
            geometryAttribute: undefined,
            geometryType: undefined,
            srs: DEFAULT_SCHEMA_SRS
        });
    });
});
