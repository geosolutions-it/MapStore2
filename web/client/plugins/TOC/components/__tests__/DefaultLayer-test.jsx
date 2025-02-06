/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import { DragDropContext as dragDropContext } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import DefaultLayer from '../DefaultLayer';

const Layer = dragDropContext(testBackend)(DefaultLayer);

describe('test DefaultLayer module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests DefaultLayer component creation (wms)', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            index: 9,
            type: 'wms'
        };
        ReactDOM.render(<Layer node={l} />, document.getElementById("container"));
        const checkbox = document.querySelector('.ms-visibility-check');
        expect(checkbox).toBeTruthy();
        const expand = document.querySelector('.ms-node-expand');
        expect(expand).toBeTruthy();
        const label = document.querySelector('.ms-node-title');
        expect(label).toBeTruthy();
        expect(label.innerHTML).toBe(l.title);
    });

    it('tests DefaultLayer component creation (no wms)', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false
        };
        ReactDOM.render(<Layer node={l} />, document.getElementById("container"));
        const checkbox = document.querySelector('.ms-visibility-check');
        expect(checkbox).toBeTruthy();
        const expand = document.querySelector('.ms-node-expand');
        expect(expand).toBeFalsy();
        const label = document.querySelector('.ms-node-title');
        expect(label).toBeTruthy();
        expect(label.innerHTML).toBe(l.title);
    });

    it('test change event', (done) => {
        const l = {
            name: 'layer00',
            id: 'layer00',
            title: 'Layer',
            visibility: false
        };
        ReactDOM.render(
            <Layer
                onChange={(value) => {
                    expect(value?.options?.visibility).toBe(true);
                    done();
                }}
                node={l}
            />, document.getElementById("container"));
        const checkbox = document.querySelector('.ms-visibility-check');
        expect(checkbox).toBeTruthy();
        TestUtils.Simulate.click(checkbox);
    });

    it('should show additional content with expand button', (done) => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            expanded: false
        };
        ReactDOM.render(<Layer node={l} onChange={(value) => {
            expect(value?.options?.expanded).toBe(true);
            done();
        }}/>, document.getElementById("container"));
        const expand = document.querySelector('.ms-node-expand');
        expect(expand).toBeTruthy();
        expect(document.querySelector('.ms-node-layer ul').style.display).toBe('none');
        TestUtils.Simulate.click(expand);
    });

    it('should include custom content with nodeContentItems prop when expanding layer node', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            expanded: true
        };
        function CustomContent() {
            return <div id="custom-content"></div>;
        }
        ReactDOM.render(<Layer node={l} nodeContentItems={[{ name: 'CustomContent', Component: CustomContent }]}/>, document.getElementById("container"));
        const expand = document.querySelector('.ms-node-expand');
        expect(expand).toBeTruthy();
        expect(document.querySelector('.ms-node-layer ul').style.display).toBe('');
        expect(document.querySelector('.ms-node-layer #custom-content')).toBeTruthy();
    });

    it('tests opacity tool', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        };
        ReactDOM.render(<Layer node={l} />, document.getElementById("container"));
        const opacity = document.querySelector(".noUi-target");
        expect(opacity).toBeTruthy();
        expect(opacity.getAttribute('disabled')).toBe(null);
    });

    it('tests opacity tool no visibility', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        };

        ReactDOM.render(<Layer node={l} />,
            document.getElementById("container"));
        const opacity = document.querySelector(".noUi-target");
        expect(opacity).toBeTruthy();
        expect(opacity.getAttribute('disabled')).toBe('true');
    });

    it('tests disable legend and opacity tools', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        };

        ReactDOM.render(
            <Layer
                node={l}
                config={{
                    hideOpacitySlider: true,
                    layerOptions: {
                        hideLegend: true
                    }
                }}
            />,
            document.getElementById("container"));
        const expand = document.querySelector('.ms-node-expand');
        expect(expand).toBeFalsy();
        const opacity = document.querySelector(".mapstore-slider");
        expect(opacity).toBeFalsy();
    });

    it('tests disable opacity tools', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        };

        ReactDOM.render(<Layer node={l} config={{ hideOpacitySlider: true }}/>,
            document.getElementById("container"));
        const expand = document.querySelector('.ms-node-expand');
        expect(expand).toBeTruthy();
        const opacity = document.querySelector(".mapstore-slider");
        expect(opacity).toBeFalsy();
    });
    it('support for indicators', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            type: 'wms',
            opacity: 0.5,
            expanded: true,
            dimensions: [{
                name: "time"
            }]
        };
        const indicators = [{
            "type": "dimension",
            "key": "calendar",
            "glyph": "calendar",
            "props": {
                className: "TIME_INDICATOR"
            },
            "condition": {
                "name": "time"
            }
        }];
        ReactDOM.render(<Layer
            indicators={indicators}
            config={{
                layerOptions: {
                    indicators
                }
            }}
            node={l}
        />, document.getElementById("container"));
        const title = document.querySelector(".TIME_INDICATOR");
        expect(title).toBeTruthy();
    });

    it('test wmts', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            type: 'wmts',
            opacity: 0.5
        };
        ReactDOM.render(<Layer node={l} />, document.getElementById("container"));
        const expand = document.querySelector('.ms-node-expand');
        expect(expand).toBeFalsy();
    });

    it('show opacity tooltip', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            opacity: 0.5
        };
        ReactDOM.render(<Layer node={l} config={{ showOpacityTooltip: true }}/>,
            document.getElementById("container"));
        const opacityTooltip = document.querySelector('.noUi-tooltip');
        expect(opacityTooltip).toBeTruthy();
        expect(opacityTooltip.innerHTML).toBe('50 %');
    });

    it('hide opacity tooltip', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            opacity: 0.5
        };
        ReactDOM.render(<Layer hideOpacityTooltip node={l}/>,
            document.getElementById("container"));
        const opacityTooltip = document.querySelector('.noUi-tooltip');
        expect(opacityTooltip).toBeFalsy();
    });

    it('should hide component with filter returning false', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            opacity: 0.5
        };
        ReactDOM.render(<Layer filter={() => false} node={l} />,
            document.getElementById("container"));
        const layerNode = document.querySelector('.ms-node-layer');
        expect(layerNode).toBeFalsy();
    });

    it('should show component with filter returning true', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            opacity: 0.5
        };
        ReactDOM.render(<Layer filter={() => true} node={l} />,
            document.getElementById("container"));
        const layerNode = document.querySelector('.ms-node-layer');
        expect(layerNode).toBeTruthy();
    });

    it('should not render collapsible (WFS/Vector without geostyler)', () => {
        let l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            opacity: 0.5,
            style: {
                'weight': 1,
                'color': 'rgba(0, 0, 255, 1)',
                'opacity': 1,
                'fillColor': 'rgba(0, 0, 255, 0.1)',
                'fillOpacity': 0.1,
                'radius': 10
            }
        };

        for (const type of ['wfs', 'vector']) {
            l.type = type;
            ReactDOM.render(<Layer node={l} />,
                document.getElementById("container"));
            const expand = document.querySelector('.ms-node-expand');
            expect(expand).toBeFalsy();
        }
    });

    it('should render collapsible (WFS/Vector with geostyler)', () => {
        const l = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            opacity: 0.5,
            style: {
                format: 'geostyler',
                body: {
                    rules: [
                        {
                            name: 'Rule name',
                            symbolizers: [
                                {
                                    color: '#FFFFFF',
                                    opacity: 1,
                                    kind: 'Line',
                                    cap: 'round',
                                    join: 'bevel'
                                }
                            ]
                        }
                    ]
                }
            }
        };

        for (const type of ['wfs', 'vector']) {
            l.type = type;
            ReactDOM.render(<Layer activateLegendTool node={l} />,
                document.getElementById("container"));
            const expand = document.querySelector('.ms-node-expand');
            expect(expand).toBeTruthy();
        }
    });
    it('test with layer source crs', () => {
        // Invalid CRS
        let node = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            opacity: 0.5,
            bbox: {
                crs: "EPSG:3946"
            }
        };

        const getNodeClassName = ({ error }) => error ? 'layer-error' : '';

        ReactDOM.render(<Layer node={node} getNodeClassName={getNodeClassName} />, document.getElementById("container"));

        let layerNode = document.querySelector('.layer-error');
        let errorTooltip = document.querySelector('.glyphicon-exclamation-mark');
        expect(layerNode).toBeTruthy();
        expect(errorTooltip).toBeTruthy();

        // Valid CRS
        node = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            opacity: 0.5,
            bbox: {
                crs: "EPSG:4326"
            }
        };

        ReactDOM.render(<Layer node={node} getNodeClassName={getNodeClassName}/>, document.getElementById("container"));

        layerNode = document.querySelector('.layer-error');
        errorTooltip = document.querySelector('.glyphicon-exclamation-mark');
        expect(layerNode).toBeFalsy();
        expect(errorTooltip).toBeFalsy();
    });

    it('should display the layer filter button if there is filters in layerFilter like filterFields/spatialFilter/legendFilter', () => {
        const layer = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            opacity: 0.5,
            layerFilter: {
                "filterFields": [
                    {
                        "rowId": 1,
                        "groupId": 1,
                        "attribute": "FIELD_01",
                        "operator": "=",
                        "value": "value01",
                        "type": "string",
                        "fieldOptions": {
                            "valuesCount": 0,
                            "currentPage": 1
                        },
                        "exception": null,
                        "loading": false,
                        "openAutocompleteMenu": false,
                        "options": {
                            "FIELD_01": []
                        }
                    }
                ]
            }
        };

        ReactDOM.render(<Layer node={layer} />, document.getElementById("container"));
        const filter = document.querySelector('.glyphicon-filter');
        expect(filter).toBeTruthy();
    });
    it('should hide the layer filter button if layerFilter is empty from any kind filters', () => {
        const layer = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            opacity: 0.5,
            layerFilter: {}
        };

        ReactDOM.render(<Layer node={layer} />, document.getElementById("container"));
        const filter = document.querySelector('.glyphicon-filter');
        expect(filter).toBeFalsy();
    });

    it('should not display the layer filter button when hideFilter is true', () => {
        const layer = {
            id: 'layer00',
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            opacity: 0.5,
            layerFilter: {}
        };

        ReactDOM.render(<Layer node={layer} config={{ layerOptions: { hideFilter: true } }} />, document.getElementById("container"));
        const filter = document.querySelector('.glyphicon-filter');
        expect(filter).toBeFalsy();
    });
});
