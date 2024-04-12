import expect from 'expect';


import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
import {
    getFeatureLayer,
    toDescribeURL,
    getCapabilitiesURL,
    getFeatureURL
} from '../WFS';

let mockAxios;

describe('Test WFS ogc API functions', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    describe('getFeatureLayer', () => {
        const schemaString = 'xmlns:gml="http://www.opengis.net/gml" '
                    + 'xmlns:wfs="http://www.opengis.net/wfs" '
                    + 'xmlns:ogc="http://www.opengis.net/ogc" '
                    + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                    + 'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" ';
        it('getFeatureLayer', (done) => {
            mockAxios.onPost().reply(({url, data, headers}) => {
                expect(url).toContain('test');
                expect(data).toEqual(
                    `<wfs:GetFeature service="WFS" version="1.1.0" `
                    + schemaString
                    + `resultType="results" outputFormat="application/json">`
                    + `<wfs:Query typeName="layer1" srsName="EPSG:4326"></wfs:Query></wfs:GetFeature>`);
                // check headers passed
                expect(headers.Authentication).toBe('Basic token');
                return [200, {
                    featureTypes: [{
                        name: 'layer1'
                    }]
                }];
            });
            getFeatureLayer({
                type: 'wfs',
                url: 'test',
                name: 'layer1'
            }, {}, {
                headers: {
                    'Authentication': 'Basic token'
                }
            }).then((data) => {
                expect(data).toExist();
                done();
            });
        });
        it('getFeatureLayer with layerFilter', (done) => {
            mockAxios.onPost().reply(({url, data}) => {
                expect(url).toContain('test');
                // some checks on the filter presence
                expect(data).toContain('<ogc:Filter>');
                expect(data).toContain('<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>');
                return [200, {
                    featureTypes: [{
                        name: 'layer1'
                    }]
                }];
            });
            getFeatureLayer({
                type: 'wfs',
                url: 'test',
                name: 'layer1',
                layerFilter: {
                    filters: [{
                        format: 'cql',
                        body: "prop = 'value'"
                    }]
                }
            }).then((data) => {
                expect(data).toExist();
                done();
            });
        });
        it('getFeatureLayer with layer filter and filter passed', (done) => {
            mockAxios.onPost().reply(({url, data}) => {
                expect(url).toContain('test');
                // some checks on the filter presence
                expect(data).toContain('<ogc:Filter><ogc:And>');
                expect(data).toContain('<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>');
                expect(data).toContain('<ogc:PropertyIsEqualTo><ogc:PropertyName>prop2</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>');

                return [200, {
                    featureTypes: [{
                        name: 'layer1'
                    }]
                }];
            });
            getFeatureLayer({
                type: 'wfs',
                url: 'test',
                name: 'layer1',
                layerFilter: {
                    filters: [{
                        format: 'cql',
                        body: "prop = 'value'"
                    }]
                }
            }, {
                filters: [{
                    // a mapstore filter
                    filters: [{
                        format: 'cql',
                        body: "prop2 = 'value'"
                    }]
                }]
            }).then((data) => {
                expect(data).toExist();
                done();
            });
        });
    });
    it('toDescribeURL with URL array', () => {
        const _url = [
            'http://gs-stable.geosolutionsgroup.com:443/geoserver1',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3'
        ];

        expect(toDescribeURL(_url, 'testName').split('?')[0]).toBe(_url[0]);
    });
    it('getCapabilitiesURL with URL array', () => {
        const _url = [
            'http://gs-stable.geosolutionsgroup.com:443/geoserver1',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3'
        ];

        expect(getCapabilitiesURL(_url).split('?')[0]).toBe(_url[0]);
    });
    it('getFeatureURL with URL array', () => {
        const _url = [
            'http://gs-stable.geosolutionsgroup.com:443/geoserver1',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3'
        ];

        expect(getFeatureURL(_url).split('?')[0]).toBe(_url[0]);
    });

    it('getFeatureURL if it includes getCapabilites request', () => {
        const _url = 'http://gs-stable.geosolutionsgroup.com:443/geoserver3/wfs?service=WFS&version=1.1.0&request=GetCapabilities';
        const featureURL = getFeatureURL(_url, "layerName");
        expect(featureURL.includes("request=GetFeature")).toBeTruthy();
        expect(featureURL.split('?')[1]).toEqual('typeName=layerName&version=1.1.0&service=WFS&request=GetFeature');
    });

    it('getFeatureURL if it includes normal getFeature request with version different than the default one', () => {
        const _url = 'http://gs-stable.geosolutionsgroup.com:443/geoserver3/wfs?service=WFS&version=1.1.1&request=GetFeature';
        const featureURL = getFeatureURL(_url, "layerName");
        expect(featureURL.split('?')[1]).toEqual('typeName=layerName&version=1.1.1&service=WFS&request=GetFeature');
    });
});
