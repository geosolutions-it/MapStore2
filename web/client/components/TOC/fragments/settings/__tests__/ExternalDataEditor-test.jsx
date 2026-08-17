/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';

import axios from '../../../../../libs/ajax';
import ExternalDataEditor, {
    getExternalAttributes,
    getWFSFeatureTypes
} from '../ExternalDataEditor';
import { validateExternalDataConfiguration } from '../../../../../utils/mapinfo/ExternalDataUtils';

let mockAxios;

const getCapabilitiesResponse = (name, title) => `
    <wfs:WFS_Capabilities xmlns:wfs="http://www.opengis.net/wfs">
        <FeatureTypeList>
            <FeatureType>
                <Name>${name}</Name>
                <Title>${title}</Title>
            </FeatureType>
        </FeatureTypeList>
    </wfs:WFS_Capabilities>
`;

describe('ExternalDataEditor', () => {
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
    });

    it('extracts WFS feature types from capabilities', () => {
        expect(getWFSFeatureTypes({
            'wfs:WFS_Capabilities': {
                FeatureTypeList: {
                    FeatureType: [{ Name: 'workspace:table', Title: 'Table' }]
                }
            }
        })).toEqual([{ name: 'workspace:table', title: 'Table' }]);
    });

    it('creates visible non-geometry attributes and preserves customization', () => {
        expect(getExternalAttributes({
            featureTypes: [{
                properties: [
                    { name: 'id', type: 'xsd:int', localType: 'number' },
                    { name: 'name', type: 'xsd:string', localType: 'string' },
                    { name: 'geom', type: 'gml:Point', localType: 'Point' }
                ]
            }]
        }, [{ name: 'name', alias: 'Label', visible: false }])).toEqual([
            { name: 'id', type: 'number', alias: '', visible: true },
            { name: 'name', type: 'string', alias: 'Label', visible: false }
        ]);
    });

    it('validates mandatory fields, placeholders and CQL syntax', () => {
        expect(validateExternalDataConfiguration({})).toBe(
            'layerProperties.externalData.validation.missingFields'
        );
        expect(validateExternalDataConfiguration({
            url: '/geoserver/wfs',
            typeName: 'workspace:table',
            cqlFilter: "target_id = '${feature.id}'"
        })).toBe('layerProperties.externalData.validation.invalidPlaceholder');
        expect(validateExternalDataConfiguration({
            url: '/geoserver/wfs',
            typeName: 'workspace:table',
            cqlFilter: "target_id = '${properties.source_id}' AND"
        })).toBe('layerProperties.externalData.validation.invalidCql');
        expect(validateExternalDataConfiguration({
            url: '/geoserver/wfs',
            typeName: 'workspace:table',
            cqlFilter: "target_id = '${properties['source_id']}'"
        })).toBe(null);
    });

    it('renders and updates CQL and attribute presentation settings', () => {
        let value = {
            url: '',
            typeName: 'workspace:table',
            cqlFilter: "target_id = '${properties.id}'",
            attributes: [{ name: 'name', type: 'string', alias: '', visible: true }]
        };
        const onChange = (nextValue) => {
            value = nextValue;
        };
        ReactDOM.render(
            <ExternalDataEditor value={value} onChange={onChange}/>,
            document.getElementById('container')
        );

        const cql = document.querySelector('[data-qa="external-data-cql"]');
        TestUtils.Simulate.change(cql, { target: { value: "code = '${properties.code}'" } });
        expect(value.cqlFilter).toBe("code = '${properties.code}'");

        ReactDOM.render(
            <ExternalDataEditor value={value} onChange={onChange}/>,
            document.getElementById('container')
        );
        const attributeContainer = document.querySelector('.ms-external-data-attributes .layer-fields-field-container');
        const attributeRow = attributeContainer.querySelector('.layer-fields-row');
        TestUtils.Simulate.click(attributeRow.querySelector('.layer-field-settings-button'));
        TestUtils.Simulate.change(attributeContainer.querySelector('.layer-field-settings-panel .layer-field-alias input'), { target: { value: 'Display name' } });
        expect(value.attributes[0].alias).toBe('Display name');

        TestUtils.Simulate.change(attributeRow.querySelector('.layer-field-visibility input'), {
            target: { checked: false }
        });
        expect(value.attributes[0].visible).toBe(false);
    });

    it('loads feature types for an initial WFS URL', () => {
        mockAxios.onGet().reply(({ url }) => {
            expect(url).toContain('/external-data-test/wfs');
            expect(url).toContain('request=GetCapabilities');
            return [200, getCapabilitiesResponse('workspace:table', 'Table')];
        });
        ReactDOM.render(
            <ExternalDataEditor
                value={{
                    url: '/external-data-test/wfs',
                    typeName: '',
                    cqlFilter: '',
                    attributes: []
                }}/>,
            document.getElementById('container')
        );

        return waitFor(() => {
            const select = document.querySelector('.ms-external-data-layer-select');
            expect(select.classList.contains('is-disabled')).toBe(false);
        }).then(() => {
            const select = document.querySelector('.ms-external-data-layer-select');
            TestUtils.Simulate.mouseDown(select.querySelector('.Select-arrow'), { button: 0 });
            expect(document.body.textContent).toContain('Table (workspace:table)');
        });
    });

    it('ignores a capabilities response superseded by a newer URL', (done) => {
        let resolveFirstRequest;
        mockAxios.onGet().reply(({ url }) => {
            if (url.includes('/external-data-first/wfs')) {
                return new Promise((resolve) => {
                    resolveFirstRequest = () => resolve([
                        200,
                        getCapabilitiesResponse('workspace:first', 'First')
                    ]);
                });
            }
            return [200, getCapabilitiesResponse('workspace:second', 'Second')];
        });
        const ControlledEditor = () => {
            const [currentValue, setCurrentValue] = React.useState({
                url: '/external-data-first/wfs',
                typeName: '',
                cqlFilter: '',
                attributes: []
            });
            return <ExternalDataEditor value={currentValue} onChange={setCurrentValue}/>;
        };
        ReactDOM.render(<ControlledEditor/>, document.getElementById('container'));

        setTimeout(() => {
            const urlInput = document.querySelector('[data-qa="external-data-url"]');
            TestUtils.Simulate.change(urlInput, {
                target: { value: '/external-data-second/wfs' }
            });
            TestUtils.Simulate.blur(document.querySelector('[data-qa="external-data-url"]'));
            setTimeout(() => {
                try {
                    const select = document.querySelector('.ms-external-data-layer-select');
                    expect(select.classList.contains('is-disabled')).toBe(false);
                    TestUtils.Simulate.mouseDown(select.querySelector('.Select-arrow'), { button: 0 });
                    expect(document.body.textContent).toContain('Second (workspace:second)');
                    resolveFirstRequest();
                    setTimeout(() => {
                        try {
                            expect(document.body.textContent).toContain('Second (workspace:second)');
                            expect(document.body.textContent).toNotContain('First (workspace:first)');
                            done();
                        } catch (error) {
                            done(error);
                        }
                    });
                } catch (error) {
                    done(error);
                }
            }, 50);
        }, 20);
    });

    it('loads non-geometry attributes when a feature type is selected', (done) => {
        mockAxios.onGet().reply(({ url }) => {
            const decodedUrl = decodeURIComponent(url);
            if (decodedUrl.includes('request=GetCapabilities')) {
                return [200, getCapabilitiesResponse('workspace:table', 'Table')];
            }
            expect(decodedUrl).toContain('request=DescribeFeatureType');
            expect(decodedUrl).toContain('typeName=workspace:table');
            return [200, {
                featureTypes: [{
                    properties: [
                        { name: 'name', type: 'xsd:string', localType: 'string' },
                        { name: 'geom', type: 'gml:Point', localType: 'Point' }
                    ]
                }]
            }];
        });
        const ControlledEditor = () => {
            const [currentValue, setCurrentValue] = React.useState({
                url: '/external-data-describe/wfs',
                typeName: '',
                cqlFilter: '',
                attributes: []
            });
            return <ExternalDataEditor value={currentValue} onChange={setCurrentValue}/>;
        };
        ReactDOM.render(<ControlledEditor/>, document.getElementById('container'));

        setTimeout(() => {
            try {
                const select = document.querySelector('.ms-external-data-layer-select');
                TestUtils.Simulate.mouseDown(select.querySelector('.Select-arrow'), { button: 0 });
                TestUtils.Simulate.keyDown(select.querySelector('.Select-control'), {
                    keyCode: 40,
                    key: 'ArrowDown'
                });
                TestUtils.Simulate.keyDown(select.querySelector('.Select-input input'), {
                    keyCode: 13,
                    key: 'Enter'
                });
                setTimeout(() => {
                    try {
                        const rows = document.querySelectorAll('.ms-external-data-attributes .layer-fields-row');
                        expect(rows.length).toBe(1);
                        expect(rows[0].querySelector('.layer-field-name input').value).toBe('name');
                        done();
                    } catch (error) {
                        done(error);
                    }
                }, 50);
            } catch (error) {
                done(error);
            }
        }, 50);
    });

    it('preserves alias and visibility when the same feature type is selected again', (done) => {
        mockAxios.onGet().reply(({ url }) => {
            const decodedUrl = decodeURIComponent(url);
            if (decodedUrl.includes('request=GetCapabilities')) {
                return [200, getCapabilitiesResponse('workspace:table', 'Table')];
            }
            return [200, {
                featureTypes: [{
                    properties: [
                        { name: 'name', type: 'xsd:string', localType: 'string' },
                        { name: 'geom', type: 'gml:Point', localType: 'Point' }
                    ]
                }]
            }];
        });
        let value = {
            url: '/external-data-reselect/wfs',
            typeName: 'workspace:table',
            cqlFilter: '',
            attributes: [{ name: 'name', type: 'string', alias: 'Label', visible: false }]
        };
        const ControlledEditor = () => {
            const [currentValue, setCurrentValue] = React.useState(value);
            return (
                <ExternalDataEditor
                    value={currentValue}
                    onChange={(nextValue) => {
                        value = nextValue;
                        setCurrentValue(nextValue);
                    }}/>
            );
        };
        ReactDOM.render(<ControlledEditor/>, document.getElementById('container'));

        setTimeout(() => {
            try {
                const select = document.querySelector('.ms-external-data-layer-select');
                TestUtils.Simulate.mouseDown(select.querySelector('.Select-arrow'), { button: 0 });
                TestUtils.Simulate.mouseDown(document.querySelector('.Select-option'), { button: 0 });
                setTimeout(() => {
                    try {
                        expect(value.attributes).toEqual([
                            { name: 'name', type: 'string', alias: 'Label', visible: false }
                        ]);
                        done();
                    } catch (error) {
                        done(error);
                    }
                }, 50);
            } catch (error) {
                done(error);
            }
        }, 50);
    });

    it('validates the complete source and external WFS request flow', (done) => {
        mockAxios.onGet().reply(({ url }) => {
            const decodedUrl = decodeURIComponent(url);
            if (decodedUrl.includes('request=GetCapabilities')) {
                return [200, getCapabilitiesResponse('workspace:external', 'External')];
            }
            if (decodedUrl.includes('/source-validation/wfs')) {
                expect(decodedUrl).toContain('typeName=workspace:source');
                expect(decodedUrl).toContain('maxFeatures=1');
                return [200, {
                    type: 'FeatureCollection',
                    features: [{
                        id: 'source.1',
                        properties: { sourceId: "A'1" }
                    }]
                }];
            }
            expect(decodedUrl).toContain('/external-validation/wfs');
            expect(decodedUrl).toContain('typeName=workspace:external');
            expect(decodedUrl).toContain("CQL_FILTER=source_id = 'A''1'");
            return [200, {
                type: 'FeatureCollection',
                features: [{
                    id: 'external.1',
                    properties: { label: 'Validated result' }
                }]
            }];
        });
        ReactDOM.render(
            <ExternalDataEditor
                sourceLayer={{
                    type: 'wfs',
                    url: '/source-validation/wfs',
                    name: 'workspace:source'
                }}
                value={{
                    url: '/external-validation/wfs',
                    typeName: 'workspace:external',
                    cqlFilter: "source_id = '${properties.sourceId}'",
                    attributes: [{
                        name: 'label',
                        alias: 'External label',
                        visible: true
                    }]
                }}/>,
            document.getElementById('container')
        );

        TestUtils.Simulate.click(
            document.querySelector('.ms-external-data-validation > button')
        );
        setTimeout(() => {
            try {
                const validation = document.querySelector('.ms-external-data-validation');
                expect(validation.querySelector('.alert-success')).toExist();
                // the generated filter is the whole feedback, the response is not rendered
                expect(validation.querySelector('.ms-external-data-generated-cql pre').textContent)
                    .toBe("source_id = 'A''1'");
                expect(validation.textContent).toNotContain('Validated result');
                done();
            } catch (error) {
                done(error);
            }
        }, 100);
    });

});
