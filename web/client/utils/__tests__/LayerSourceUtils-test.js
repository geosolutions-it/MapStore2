/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import AxiosMockAdapter from 'axios-mock-adapter';

import axios from '../../libs/ajax';
import {
    SOURCE_FIELDS,
    buildChanges,
    getSourceFields,
    isEmptyValue,
    toLayer,
    validateSourceField
} from '../LayerSourceUtils';

const getFieldValue = (field, layer) => SOURCE_FIELDS[field].format(SOURCE_FIELDS[field].get(layer));

const WMS_CAPABILITIES = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0">
    <Capability>
        <Request><GetMap><Format>image/png</Format></GetMap></Request>
        <Layer><Layer><Name>layer00</Name><Title>Layer</Title></Layer></Layer>
    </Capability>
</WMS_Capabilities>`;

const WFS_DESCRIBE = {
    featureTypes: [{
        typeName: 'workspace:layer',
        properties: [{name: 'shared', localType: 'string'}, {name: 'added', localType: 'number'}]
    }]
};

const OGC_EXCEPTION = `<?xml version="1.0" encoding="UTF-8"?>
<ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows/1.1" version="2.0.0">
    <ows:Exception exceptionCode="InvalidParameterValue" locator="typeName">
        <ows:ExceptionText>Feature type unknown</ows:ExceptionText>
    </ows:Exception>
</ows:ExceptionReport>`;

const expectSourceError = (promise, code, field) => promise
    .then(() => {
        throw new Error('validation should fail');
    }, (error) => {
        expect(error.name).toBe('LayerSourceError');
        expect(error.code).toBe(code);
        expect(error.field).toBe(field);
    });

let mockAxios;

describe('LayerSourceUtils', () => {
    beforeEach(() => {
        mockAxios = new AxiosMockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    it('isEmptyValue', () => {
        expect(isEmptyValue(undefined)).toBe(true);
        expect(isEmptyValue(' ')).toBe(true);
        expect(isEmptyValue([])).toBe(true);
        expect(isEmptyValue(['url', ''])).toBe(true);
        expect(isEmptyValue(0)).toBe(false);
        expect(isEmptyValue(['url-1', 'url-2'])).toBe(false);
    });

    it('formats and parses field values', () => {
        expect(getFieldValue('url', {url: ['url-1', 'url-2']})).toBe('url-1, url-2');
        expect(SOURCE_FIELDS.url.parse('url-1, url-2')).toEqual(['url-1', 'url-2']);
        expect(SOURCE_FIELDS.url.parse('url-1')).toBe('url-1');
        expect(SOURCE_FIELDS.name.parse).toNotExist();
        expect(getFieldValue('name', {name: 0})).toBe('0');
        expect(getFieldValue('name', {})).toBe('');
        expect(getFieldValue('searchTypeName', {name: 'layer', search: {type: 'wfs'}})).toBe('layer');
        expect(getFieldValue('searchTypeName', {name: 'layer', search: {type: 'wfs', typeName: 'linked'}})).toBe('linked');
    });

    it('getSourceFields', () => {
        expect(getSourceFields({type: 'wms'})).toEqual(['name', 'url']);
        expect(getSourceFields({type: 'wms', search: {type: 'wfs'}})).toEqual(['name', 'url', 'searchUrl', 'searchTypeName']);
        expect(getSourceFields({type: 'wfs', search: {type: 'wfs'}})).toEqual(['name', 'url']);
        expect(getSourceFields({type: 'arcgis-feature'})).toEqual(['name']);
        expect(getSourceFields({type: 'arcgis', name: '1'})).toEqual(['name']);
        expect(getSourceFields({type: 'arcgis'})).toEqual([]);
        expect(getSourceFields({type: 'wmts'})).toEqual([]);
        expect(getSourceFields({type: 'wms'}, 'groups')).toEqual(['url']);
    });

    it('toLayer applies only the edited values', () => {
        const element = {type: 'wms', name: 'old', url: 'old-url', search: {type: 'wfs', url: 'wfs-url', custom: 'value'}};
        expect(toLayer(element, {})).toEqual(element);
        expect(toLayer(element, {name: 'new'})).toEqual({...element, name: 'new'});
        const layer = toLayer(element, {url: 'new-url', searchUrl: 'new-wfs-url'});
        expect(layer.url).toBe('new-url');
        expect(layer.search).toEqual({type: 'wfs', url: 'new-wfs-url', custom: 'value'});
        expect(layer.search.typeName).toNotExist();
        expect(toLayer(element, {searchTypeName: 'linked'}).search.typeName).toBe('linked');
        expect(toLayer({type: 'wms', name: 'layer'}, {name: 'new'}).search).toNotExist();
    });

    it('buildChanges adds the validated schema properties', () => {
        const fields = [{name: 'shared', type: 'string'}];
        expect(buildChanges({type: 'wfs'}, 'name', 'new', {fields})).toEqual({name: 'new', fields});
        expect(buildChanges({type: 'wfs'}, 'url', 'new-url', {fields})).toEqual({url: 'new-url', fields});
        expect(buildChanges({type: 'wms'}, 'url', ['url-1', 'url-2'], {})).toEqual({url: ['url-1', 'url-2']});
        expect(buildChanges({type: 'wms', search: {type: 'wfs'}}, 'name', 'new', {fields})).toEqual({name: 'new', fields});
        expect(buildChanges({type: 'wms', search: {type: 'wfs', typeName: 'linked'}}, 'name', 'new', {})).toEqual({name: 'new'});
        expect(buildChanges({type: 'arcgis'}, 'name', '2')).toEqual({name: '2'});
        expect(buildChanges({type: 'arcgis-feature'}, 'name', '1', {fields, properties: {shared: ''}, geometryType: 'Point'}))
            .toEqual({name: '1', fields, properties: {shared: ''}, geometryType: 'Point'});
    });

    it('buildChanges preserves the linked WFS properties', () => {
        const element = {type: 'wms', search: {type: 'wfs', url: 'wfs-url', custom: 'value'}};
        expect(buildChanges(element, 'searchUrl', 'new-wfs-url', {fields: []})).toEqual({
            search: {type: 'wfs', url: 'new-wfs-url', custom: 'value'},
            fields: []
        });
        expect(buildChanges(element, 'searchTypeName', 'linked', {fields: []})).toEqual({
            search: {type: 'wfs', url: 'wfs-url', custom: 'value', typeName: 'linked'},
            fields: []
        });
    });

    it('buildChanges resets the schema properties when forced', () => {
        expect(buildChanges({type: 'wfs', fields: []}, 'url', 'bad-url', undefined, {forced: true}))
            .toEqual({url: 'bad-url', fields: undefined});
        expect(buildChanges({type: 'wms', search: {type: 'wfs'}}, 'name', 'bad', undefined, {forced: true}))
            .toEqual({name: 'bad', fields: undefined});
        expect(buildChanges({type: 'arcgis-feature'}, 'name', '9', undefined, {forced: true}))
            .toEqual({name: '9', fields: undefined, properties: undefined, geometryType: undefined});
        expect(buildChanges({type: 'wms'}, 'url', 'bad-url', undefined, {forced: true})).toEqual({url: 'bad-url'});
    });

    it('resolves without validation for layers types without validators', (done) => {
        validateSourceField('name', {type: 'wmts', name: ''})
            .then((result) => {
                expect(result).toEqual({});
                expect(mockAxios.history.get.length).toBe(0);
            })
            .then(() => done(), done);
    });

    it('validates a WMS URL with the current name', (done) => {
        mockAxios.onGet().reply(200, WMS_CAPABILITIES);
        validateSourceField('url', toLayer({type: 'wms', name: 'wrong', url: 'old-url'}, {name: 'layer00', url: ['url-1', 'url-2']}))
            .then((result) => {
                expect(result).toEqual({});
                expect(mockAxios.history.get.map(({url}) => url.split('?')[0])).toEqual(['url-1', 'url-2']);
            })
            .then(() => done(), done);
    });

    it('rejects a WMS name missing from the capabilities', (done) => {
        mockAxios.onGet().reply(200, WMS_CAPABILITIES);
        expectSourceError(validateSourceField('name', {type: 'wms', name: 'missing', url: 'wms-url'}), 'notFound', 'name')
            .then(() => done(), done);
    });

    it('rejects an unreachable WMS URL', (done) => {
        mockAxios.onGet().reply(500);
        expectSourceError(validateSourceField('url', {type: 'wms', name: 'layer00', url: 'wms-url'}), 'service', 'url')
            .then(() => done(), done);
    });

    it('rejects a WMS URL while the name is empty', (done) => {
        expectSourceError(validateSourceField('url', {type: 'wms', name: '', url: 'wms-url'}), 'required', 'name')
            .then(() => expect(mockAxios.history.get.length).toBe(0))
            .then(() => done(), done);
    });

    it('validates the linked WFS when the WMS name supplies the type name', (done) => {
        mockAxios.onGet().reply(({url}) => url.indexOf('GetCapabilities') >= 0
            ? [200, WMS_CAPABILITIES.replace('layer00', 'workspace:layer')]
            : [200, WFS_DESCRIBE]);
        validateSourceField('name', {
            type: 'wms',
            name: 'workspace:layer',
            url: 'wms-url',
            search: {type: 'wfs', url: 'wfs-url'},
            fields: [{name: 'shared', type: 'string', alias: 'Customized'}]
        })
            .then((result) => {
                expect(decodeURIComponent(mockAxios.history.get[1].url)).toContain('typeName=workspace:layer');
                expect(result).toEqual({
                    fields: [
                        {name: 'shared', type: 'string', alias: 'Customized'},
                        {name: 'added', type: 'number'}
                    ]
                });
            })
            .then(() => done(), done);
    });

    it('validates a native WFS with the current values and ignores stale URLs', (done) => {
        mockAxios.onGet().reply(200, WFS_DESCRIBE);
        const element = {
            type: 'wfs',
            name: 'workspace:old',
            url: 'old-url',
            describeFeatureTypeURL: 'old-describe-url',
            search: {url: 'old-search-url'}
        };
        validateSourceField('name', toLayer(element, {name: 'workspace:layer', url: 'new-url'}))
            .then((result) => {
                const requestURL = decodeURIComponent(mockAxios.history.get[0].url);
                expect(requestURL).toContain('new-url');
                expect(requestURL).toContain('typeName=workspace:layer');
                expect(requestURL).toNotContain('old-describe-url');
                expect(requestURL).toNotContain('old-search-url');
                expect(result.fields.length).toBe(2);
            })
            .then(() => done(), done);
    });

    it('classifies native WFS failures', (done) => {
        const layer = {type: 'wfs', name: 'workspace:missing', url: 'wfs-url'};
        mockAxios.onGet().replyOnce(500)
            .onGet().replyOnce(200, OGC_EXCEPTION)
            .onGet().replyOnce(400, OGC_EXCEPTION)
            .onGet().replyOnce(200, WFS_DESCRIBE);
        expectSourceError(validateSourceField('url', layer), 'service', 'url')
            .then(() => expectSourceError(validateSourceField('url', layer), 'notFound', 'name'))
            .then(() => expectSourceError(validateSourceField('url', layer), 'notFound', 'name'))
            .then(() => expectSourceError(validateSourceField('name', layer), 'notFound', 'name'))
            .then(() => done(), done);
    });

    it('validates the linked WFS with the current values', (done) => {
        mockAxios.onGet().reply(200, WFS_DESCRIBE);
        const element = {
            type: 'wms',
            name: 'workspace:old',
            url: 'wms-url',
            search: {type: 'wfs', url: 'old-wfs-url'}
        };
        validateSourceField('searchUrl', toLayer(element, {name: 'workspace:layer', searchUrl: 'new-wfs-url'}))
            .then((result) => {
                const requestURL = decodeURIComponent(mockAxios.history.get[0].url);
                expect(requestURL).toContain('new-wfs-url');
                expect(requestURL).toContain('typeName=workspace:layer');
                expect(result.fields.length).toBe(2);
            })
            .then(() => done(), done);
    });

    it('classifies linked WFS failures on the linked fields', (done) => {
        mockAxios.onGet().replyOnce(500).onGet().replyOnce(200, OGC_EXCEPTION);
        const layer = {type: 'wms', name: 'workspace:layer', url: 'wms-url', search: {type: 'wfs', url: 'wfs-url'}};
        expectSourceError(validateSourceField('searchUrl', layer), 'service', 'searchUrl')
            .then(() => expectSourceError(validateSourceField('searchTypeName', layer), 'notFound', 'searchTypeName'))
            .then(() => expectSourceError(
                validateSourceField('searchTypeName', toLayer(layer, {searchUrl: ''})),
                'required',
                'searchUrl'
            ))
            .then(() => done(), done);
    });

    it('validates an ArcGIS FeatureServer name and merges its fields', (done) => {
        mockAxios.onGet('/arcgis/rest/services/SourceUtils/FeatureServer/1').reply(200, {
            geometryType: 'esriGeometryPoint',
            fields: [
                {name: 'kept', alias: 'Server alias', type: 'esriFieldTypeString'},
                {name: 'added', alias: 'Added', type: 'esriFieldTypeInteger'}
            ]
        });
        validateSourceField('name', {
            type: 'arcgis-feature',
            name: '1',
            url: '/arcgis/rest/services/SourceUtils/FeatureServer',
            fields: [{name: 'kept', alias: 'Custom alias', type: 'esriFieldTypeString', visible: false}]
        })
            .then((result) => {
                expect(result).toEqual({
                    fields: [
                        {name: 'kept', alias: 'Custom alias', type: 'esriFieldTypeString', visible: false},
                        {name: 'added', alias: 'Added', type: 'esriFieldTypeInteger'}
                    ],
                    properties: {kept: '', added: 0},
                    geometryType: 'Point'
                });
            })
            .then(() => done(), done);
    });

    it('classifies ArcGIS FeatureServer failures', (done) => {
        mockAxios.onGet('/arcgis/rest/services/SourceErrors/FeatureServer/9').reply(200, {error: {code: 400, message: 'Invalid layer'}});
        mockAxios.onGet('/arcgis/rest/services/SourceUnreachable/FeatureServer/1').reply(500);
        expectSourceError(
            validateSourceField('name', {type: 'arcgis-feature', name: '9', url: '/arcgis/rest/services/SourceErrors/FeatureServer'}),
            'notFound',
            'name'
        )
            .then(() => expectSourceError(
                validateSourceField('name', {type: 'arcgis-feature', name: '1', url: '/arcgis/rest/services/SourceUnreachable/FeatureServer'}),
                'service',
                'url'
            ))
            .then(() => expectSourceError(
                validateSourceField('name', {type: 'arcgis-feature', name: ' ', url: '/arcgis/rest/services/SourceErrors/FeatureServer'}),
                'required',
                'name'
            ))
            .then(() => done(), done);
    });

    it('rejects an empty ArcGIS MapServer name', (done) => {
        expectSourceError(validateSourceField('name', {type: 'arcgis', name: '', url: 'arcgis-url'}), 'required', 'name')
            .then(() => validateSourceField('name', {type: 'arcgis', name: '2', url: 'arcgis-url'}))
            .then((result) => expect(result).toEqual({}))
            .then(() => done(), done);
    });
});
