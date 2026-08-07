/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';

import axios from '../../../../../libs/ajax';
import ExternalDataViewer from '../ExternalDataViewer';
import RowViewer from '../row/RowViewer';
import { getVisibleFeatureRow } from '../../../../../utils/IdentifyUtils';
import { clearExternalDataCacheForIdentifyRequests } from '../../../../../utils/mapinfo/ExternalDataCache';

const layer = {
    featureInfo: {
        id: 'external-view',
        identifyRequestId: 'identify-external',
        featuresService: {
            url: '/external/wfs',
            typeName: 'workspace:external',
            cqlFilter: "source_id = '${properties.sourceId}'",
            attributes: [{ name: 'label', alias: 'External label', visible: true }]
        }
    }
};

const response = {
    type: 'FeatureCollection',
    features: [{
        id: 'source.1',
        properties: { sourceId: "O'Brien" }
    }]
};

describe('ExternalDataViewer', () => {
    let mockAxios;

    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        clearExternalDataCacheForIdentifyRequests(['identify-external']);
        mockAxios.restore();
        document.body.innerHTML = '';
    });

    it('queries the external WFS and renders configured feature attributes', (done) => {
        mockAxios.onGet().reply(({ url }) => {
            expect(decodeURIComponent(url)).toContain("CQL_FILTER=source_id = 'O''Brien'");
            expect(decodeURIComponent(url)).toContain('typeName=workspace:external');
            expect(decodeURIComponent(url)).toContain('maxFeatures=10');
            return [200, {
                type: 'FeatureCollection',
                features: [{
                    id: 'external.1',
                    properties: { label: 'Related feature', hidden: 'Not rendered' }
                }]
            }];
        });

        ReactDOM.render(
            <ExternalDataViewer layer={layer} response={response}/>,
            document.getElementById('container')
        );

        setTimeout(() => {
            const container = document.getElementById('container');
            expect(container.querySelector('.ms-external-data-result h4').textContent)
                .toBe('source.1');
            expect(container.textContent).toContain('external.1');
            expect(container.textContent).toContain('External label');
            expect(container.textContent).toContain('Related feature');
            expect(container.textContent).toNotContain('Not rendered');
            done();
        });
    });

    it('queries and keeps results associated with multiple source features', (done) => {
        mockAxios.onGet().reply(({ url }) => {
            const decodedUrl = decodeURIComponent(url);
            expect(decodedUrl).toContain('maxFeatures=10');
            const sourceId = decodedUrl.includes("source_id = 'A'") ? 'A' : 'B';
            return [200, {
                type: 'FeatureCollection',
                features: [{
                    id: `external.${sourceId}`,
                    properties: { label: `Related ${sourceId}` }
                }]
            }];
        });

        ReactDOM.render(
            <ExternalDataViewer
                layer={layer}
                response={{
                    features: [
                        { id: 'source.A', properties: { sourceId: 'A' } },
                        { id: 'source.B', properties: { sourceId: 'B' } }
                    ]
                }}/>,
            document.getElementById('container')
        );

        setTimeout(() => {
            try {
                const results = document.querySelectorAll('.ms-external-data-result');
                expect(mockAxios.history.get.length).toBe(2);
                expect(results.length).toBe(2);
                expect(results[0].querySelector('h4').textContent).toBe('source.A');
                expect(results[0].textContent).toContain('Related A');
                expect(results[0].textContent).toNotContain('Related B');
                expect(results[1].querySelector('h4').textContent).toBe('source.B');
                expect(results[1].textContent).toContain('Related B');
                expect(results[1].textContent).toNotContain('Related A');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('ignores a stale external response after the source response changes', (done) => {
        let resolveOldRequest;
        mockAxios.onGet().reply(({ url }) => {
            const decodedUrl = decodeURIComponent(url);
            if (decodedUrl.includes("source_id = 'old'")) {
                return new Promise((resolve) => {
                    resolveOldRequest = () => resolve([200, {
                        type: 'FeatureCollection',
                        features: [{ properties: { label: 'Old result' } }]
                    }]);
                });
            }
            return [200, {
                type: 'FeatureCollection',
                features: [{ properties: { label: 'Current result' } }]
            }];
        });
        const container = document.getElementById('container');

        ReactDOM.render(
            <ExternalDataViewer
                layer={layer}
                response={{ features: [{ properties: { sourceId: 'old' } }] }}/>,
            container
        );
        setTimeout(() => {
            ReactDOM.render(
                <ExternalDataViewer
                    layer={layer}
                    response={{ features: [{ properties: { sourceId: 'current' } }] }}/>,
                container
            );
            setTimeout(() => {
                expect(container.textContent).toContain('Current result');
                expect(resolveOldRequest).toBeA('function');
                resolveOldRequest();
                setTimeout(() => {
                    expect(container.textContent).toContain('Current result');
                    expect(container.textContent).toNotContain('Old result');
                    done();
                });
            });
        });
    });

    it('renders external attribute aliases in the current locale', () => {
        const row = getVisibleFeatureRow(
            {properties: {label: 'Valore'}},
            [{
                name: 'label',
                alias: {
                    'default': 'External label',
                    'it-IT': 'Etichetta esterna'
                },
                visible: true
            }]
        );
        ReactDOM.render(
            <IntlProvider locale="it-IT">
                <RowViewer
                    feature={row.feature}
                    layer={{fields: row.fields}}/>
            </IntlProvider>,
            document.getElementById('container')
        );

        expect(document.querySelector('.ms-properties-viewer-key').textContent)
            .toBe('Etichetta esterna');
    });


    it('reuses the cached request when the same view mounts again', (done) => {
        let requestCount = 0;
        mockAxios.onGet().reply(() => {
            requestCount += 1;
            return [200, { type: 'FeatureCollection', features: [] }];
        });
        const container = document.getElementById('container');

        ReactDOM.render(<ExternalDataViewer layer={layer} response={response}/>, container);
        setTimeout(() => {
            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(<ExternalDataViewer layer={layer} response={response}/>, container);
            setTimeout(() => {
                expect(requestCount).toBe(1);
                done();
            });
        });
    });

    it('does not reload when the layer object changes but the configuration does not', (done) => {
        let requestCount = 0;
        mockAxios.onGet().reply(() => {
            requestCount += 1;
            return [200, { type: 'FeatureCollection', features: [] }];
        });
        const container = document.getElementById('container');

        ReactDOM.render(<ExternalDataViewer layer={layer} response={response}/>, container);
        setTimeout(() => {
            expect(requestCount).toBe(1);
            // clearing the cache isolates "the effect refired" from "the request was cached"
            clearExternalDataCacheForIdentifyRequests(['identify-external']);
            ReactDOM.render(
                <ExternalDataViewer
                    layer={{ featureInfo: { ...layer.featureInfo, featuresService: { ...layer.featureInfo.featuresService } } }}
                    response={response}/>,
                container
            );
            setTimeout(() => {
                try {
                    expect(requestCount).toBe(1);
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });
    });

    it('reloads when the configured filter changes', (done) => {
        const filters = [];
        mockAxios.onGet().reply(({ url }) => {
            filters.push(decodeURIComponent(url).match(/CQL_FILTER=([^&]*)/)[1]);
            return [200, { type: 'FeatureCollection', features: [] }];
        });
        const container = document.getElementById('container');

        ReactDOM.render(<ExternalDataViewer layer={layer} response={response}/>, container);
        setTimeout(() => {
            ReactDOM.render(
                <ExternalDataViewer
                    layer={{
                        featureInfo: {
                            ...layer.featureInfo,
                            featuresService: {
                                ...layer.featureInfo.featuresService,
                                cqlFilter: "other_id = '${properties.sourceId}'"
                            }
                        }
                    }}
                    response={response}/>,
                container
            );
            setTimeout(() => {
                try {
                    expect(filters.length).toBe(2);
                    expect(filters[0]).toContain('source_id');
                    expect(filters[1]).toContain('other_id');
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });
    });

    it('does not request anything when the service configuration is incomplete', (done) => {
        ReactDOM.render(
            <ExternalDataViewer
                layer={{
                    featureInfo: {
                        identifyRequestId: 'identify-external',
                        featuresService: { url: '/external/wfs' }
                    }
                }}
                response={response}/>,
            document.getElementById('container')
        );

        setTimeout(() => {
            try {
                expect(mockAxios.history.get.length).toBe(0);
                expect(document.querySelector('.alert-warning')).toExist();
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('shares a cached request across views with different presentation settings', (done) => {
        let requestCount = 0;
        mockAxios.onGet().reply(() => {
            requestCount += 1;
            return [200, {
                type: 'FeatureCollection',
                features: [{
                    id: 'external.shared',
                    properties: {
                        label: 'Label value',
                        code: 'Code value'
                    }
                }]
            }];
        });
        const container = document.getElementById('container');
        const firstLayer = {
            featureInfo: {
                ...layer.featureInfo,
                id: 'first-view'
            }
        };
        const secondLayer = {
            featureInfo: {
                ...layer.featureInfo,
                id: 'second-view',
                featuresService: {
                    ...layer.featureInfo.featuresService,
                    attributes: [{ name: 'code', alias: 'Second view code', visible: true }]
                }
            }
        };

        ReactDOM.render(<ExternalDataViewer layer={firstLayer} response={response}/>, container);
        setTimeout(() => {
            expect(container.textContent).toContain('External label');
            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(<ExternalDataViewer layer={secondLayer} response={response}/>, container);
            setTimeout(() => {
                expect(requestCount).toBe(1);
                expect(container.textContent).toContain('Second view code');
                expect(container.textContent).toContain('Code value');
                expect(container.textContent).toNotContain('External label');
                done();
            });
        });
    });

    it('reports a missing source property without making a request', (done) => {
        ReactDOM.render(
            <ExternalDataViewer
                layer={layer}
                response={{ features: [{ id: 'source.1', properties: {} }] }}/>,
            document.getElementById('container')
        );

        setTimeout(() => {
            expect(mockAxios.history.get.length).toBe(0);
            const alert = document.querySelector('.alert-danger');
            expect(alert).toExist();
            expect(alert.textContent).toContain('layerProperties.externalData.missingProperty');
            expect(alert.querySelector('details')).toNotExist();
            done();
        });
    });


    it('retries a failed request and renders the successful response', (done) => {
        let requestCount = 0;
        mockAxios.onGet().reply(() => {
            requestCount += 1;
            return requestCount === 1
                ? [500, { message: 'Temporary failure' }]
                : [200, {
                    type: 'FeatureCollection',
                    features: [{ id: 'external.retry', properties: { label: 'Recovered' } }]
                }];
        });

        ReactDOM.render(
            <ExternalDataViewer layer={layer} response={response}/>,
            document.getElementById('container')
        );

        setTimeout(() => {
            expect(document.querySelector('.alert-danger')).toExist();
            TestUtils.Simulate.click(document.querySelector('.alert-danger button'));
            setTimeout(() => {
                expect(requestCount).toBe(2);
                expect(document.getElementById('container').textContent).toContain('Recovered');
                done();
            });
        });
    });
});
