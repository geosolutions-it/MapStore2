/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import VectorLegend from '../VectorLegend';
import { INTERACTIVE_LEGEND_ID } from '../../../../utils/LegendUtils';
import { setConfigProp } from '../../../../utils/ConfigUtils';

const rules = [
    {
        "name": ">= 0 and < 0.6",
        "filter": [
            "&&",
            [
                ">=",
                "priority",
                0
            ],
            [
                "<",
                "priority",
                0.6
            ]
        ],
        "symbolizers": [
            {
                "kind": "Fill",
                "color": "#fff7ec",
                "fillOpacity": 1,
                "outlineColor": "#777777",
                "outlineWidth": 1,
                "msClassificationType": "both",
                "msClampToGround": true
            }
        ]
    },
    {
        "name": ">= 0.6 and < 1.2",
        "filter": [
            "&&",
            [
                ">=",
                "priority",
                0.6
            ],
            [
                "<",
                "priority",
                1.2
            ]
        ],
        "symbolizers": [
            {
                "kind": "Fill",
                "color": "#fdd49e",
                "fillOpacity": 1,
                "outlineColor": "#777777",
                "outlineWidth": 1,
                "msClassificationType": "both",
                "msClampToGround": true
            }
        ]
    },
    {
        "name": ">= 1.2 and < 1.7999999999999998",
        "filter": [
            "&&",
            [
                ">=",
                "priority",
                1.2
            ],
            [
                "<",
                "priority",
                1.7999999999999998
            ]
        ],
        "symbolizers": [
            {
                "kind": "Fill",
                "color": "#fc8d59",
                "fillOpacity": 1,
                "outlineColor": "#777777",
                "outlineWidth": 1,
                "msClassificationType": "both",
                "msClampToGround": true
            }
        ]
    },
    {
        "name": ">= 1.7999999999999998 and < 2.4",
        "filter": [
            "&&",
            [
                ">=",
                "priority",
                1.7999999999999998
            ],
            [
                "<",
                "priority",
                2.4
            ]
        ],
        "symbolizers": [
            {
                "kind": "Fill",
                "color": "#d7301f",
                "fillOpacity": 1,
                "outlineColor": "#777777",
                "outlineWidth": 1,
                "msClassificationType": "both",
                "msClampToGround": true
            }
        ]
    },
    {
        "name": ">= 2.4 and <= 3",
        "filter": [
            "&&",
            [
                ">=",
                "priority",
                2.4
            ],
            [
                "<=",
                "priority",
                3
            ]
        ],
        "symbolizers": [
            {
                "kind": "Fill",
                "color": "#7f0000",
                "fillOpacity": 1,
                "outlineColor": "#777777",
                "outlineWidth": 1,
                "msClassificationType": "both",
                "msClampToGround": true
            }
        ]
    }
];
describe('VectorLegend module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setConfigProp('miscSettings', { experimentalInteractiveLegend: true });
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setConfigProp('miscSettings', { });
        setTimeout(done);
    });

    it('Should render item for "Line" symbolizer', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629c7af',
                        name: 'Some Line',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#8426c9',
                                width: 9,
                                dasharray: [72, 72],
                                cap: 'butt',
                                join: 'round',
                                opacity: 0.5
                            }
                        ]
                    }
                ]
            }
        };
        ReactDOM.render(<VectorLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.ms-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some Line');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-legend-icon');
        expect(iconContainerElement.length).toBe(1);
        const expectedSVG = '<svg viewBox="0 0 50 50"><path d="M 7 7 L 43 43" stroke="#8426c9" stroke-width="7" stroke-dasharray="18 18" stroke-linecap="butt" stroke-linejoin="round" stroke-opacity="0.5"></path></svg>';
        expect(iconContainerElement[0].innerHTML).toBe(expectedSVG);
    });

    it('Should render item for "Line" 0 width', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629c7af',
                        name: 'Some Line',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#8426c9',
                                width: 0,
                                cap: 'butt',
                                join: 'round',
                                opacity: 0.5
                            }
                        ]
                    }
                ]
            }
        };
        ReactDOM.render(<VectorLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.ms-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some Line');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-legend-icon');
        expect(iconContainerElement.length).toBe(1);
        const expectedSVG = '<svg viewBox="0 0 50 50"><path d="M 1 1 L 49 49" stroke="#8426c9" stroke-width="1" stroke-linecap="butt" stroke-linejoin="round" stroke-opacity="0.5"></path></svg>';
        expect(iconContainerElement[0].innerHTML).toBe(expectedSVG);
    });

    it('Should clamp large line width to render on icon', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629c7af',
                        name: 'Some Line',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#8426c9',
                                width: 15,
                                cap: 'butt',
                                join: 'round',
                                opacity: 0.5
                            }
                        ]
                    }
                ]
            }
        };
        ReactDOM.render(<VectorLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.ms-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some Line');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-legend-icon');
        expect(iconContainerElement.length).toBe(1);
        const expectedSVG = '<svg viewBox="0 0 50 50"><path d="M 7 7 L 43 43" stroke="#8426c9" stroke-width="7" stroke-linecap="butt" stroke-linejoin="round" stroke-opacity="0.5"></path></svg>';
        expect(iconContainerElement[0].innerHTML).toBe(expectedSVG);
    });

    it('Should render item for "Fill" symbolizer', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629c7af',
                        name: 'Some polygon',
                        symbolizers: [
                            {
                                "kind": "Fill",
                                "color": "#28ee50",
                                "opacity": 0.1,
                                "fillOpacity": 1,
                                "outlineColor": "#17ad31",
                                "outlineOpacity": 1,
                                "outlineWidth": 6,
                                "symbolizerId": "1708d931-42f5-11ed-b9d2-fbb7c629c7af"
                            }
                        ]
                    }
                ]
            }
        };
        ReactDOM.render(<VectorLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.ms-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some polygon');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-legend-icon');
        expect(iconContainerElement.length).toBe(1);
        const expectedSVG = '<svg viewBox="0 0 50 50"><path d="M 1 1 L 1 49 L 49 49 L 49 1 L 1 1" fill="#28ee50" opacity="1" stroke="#17ad31" stroke-width="6" stroke-opacity="1"></path></svg>';
        expect(iconContainerElement[0].innerHTML).toBe(expectedSVG);
    });

    it('Should render item for "Mark" symbolizer', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629c7af',
                        name: 'Some mark',
                        symbolizers: [
                            {
                                "kind": "Mark",
                                "wellKnownName": "Circle",
                                "color": "#3321f5",
                                "fillOpacity": 1,
                                "strokeColor": "#777777",
                                "strokeOpacity": 1,
                                "strokeWidth": 1,
                                "radius": 16,
                                "rotate": 55,
                                "msBringToFront": false,
                                "symbolizerId": "e98902b1-42f3-11ed-b9d2-fbb7c629c7af"
                            }
                        ]
                    }
                ]
            }
        };
        ReactDOM.render(<VectorLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.ms-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some mark');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-legend-icon');
        expect(iconContainerElement.length).toBe(1);
        const expectedSVG = '<svg viewBox="0 0 50 50" style="transform: rotate(55deg);"></svg>';
        expect(iconContainerElement[0].innerHTML).toBe(expectedSVG);
    });

    it('Should render item for "Icon" symbolizer', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629c7af',
                        name: 'Some icon',
                        symbolizers: [
                            {
                                "kind": "Icon",
                                "image": "https://url.to.image",
                                "opacity": 1,
                                "size": 32,
                                "rotate": 0,
                                "msBringToFront": false,
                                "symbolizerId": "d21a3951-42f8-11ed-b9d2-fbb7c629c7af"
                            }
                        ]
                    }
                ]
            }
        };
        ReactDOM.render(<VectorLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.ms-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].getAttribute('class')).toBe('glyphicon glyphicon-point');
    });

    it('Should render multiple items', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629c7af',
                        name: 'Some polygon',
                        symbolizers: [
                            {
                                "kind": "Fill",
                                "color": "#28ee50",
                                "opacity": 0.1,
                                "fillOpacity": 1,
                                "outlineColor": "#17ad31",
                                "outlineOpacity": 1,
                                "outlineWidth": 6,
                                "symbolizerId": "1708d931-42f5-11ed-b9d2-fbb7c629c7af"
                            }
                        ]
                    },
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629asddf',
                        name: 'Some Line',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#8426c9',
                                width: 9,
                                dasharray: [72, 72],
                                cap: 'butt',
                                join: 'round',
                                opacity: 0.5
                            }
                        ]
                    },
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629eeea',
                        name: 'Some Circle',
                        symbolizers: [
                            {
                                kind: 'Circle',
                                color: '#ff0000',
                                opacity: 0.5,
                                outlineColor: '#00ff00',
                                outlineWidth: 2,
                                radius: 1000000,
                                geodesic: true,
                                outlineOpacity: 0.25,
                                outlineDasharray: [10, 10]
                            }
                        ]
                    }
                ]
            }
        };
        ReactDOM.render(<VectorLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.ms-legend-rule');
        expect(ruleElements.length).toBe(3);
    });

    it('Should handle unnamed rule', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        ruleId: '7fefb4f0-42f5-11ed-b9d2-fbb7c629c7af',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#8426c9',
                                width: 9,
                                dasharray: [72, 72],
                                cap: 'butt',
                                join: 'round',
                                opacity: 0.5
                            }
                        ]
                    }
                ]
            }
        };
        ReactDOM.render(<VectorLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.ms-legend-rule');
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('');
    });
    it('tests legend with empty rules', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wfs',
            url: 'http://localhost:8080/geoserver1/wfs',
            style: {format: 'geostyler', body: {rules: []}}
        };

        ReactDOM.render(<VectorLegend style={{format: 'geostyler',
            body: {rules: []}}} layer={l} />, document.getElementById("container"));
        const legendElem = document.querySelector('.ms-legend');
        expect(legendElem).toBeTruthy();
        expect(legendElem.innerText).toBe('layerProperties.interactiveLegend.noLegendData');
    });
    it('tests legend with incompatible filter rules', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wfs',
            url: 'http://localhost:8080/geoserver2/wfs',
            enableInteractiveLegend: true,
            layerFilter: {
                filters: [{
                    id: INTERACTIVE_LEGEND_ID,
                    filters: [{
                        id: 'filter1'
                    }]
                }],
                disabled: false
            }
        };
        ReactDOM.render(<VectorLegend interactive style={{format: 'geostyler', body: {rules: rules}}} layer={l} />, document.getElementById("container"));
        const legendElem = document.querySelector('.ms-legend');
        expect(legendElem).toBeTruthy();
        const legendRuleElem = document.querySelector('.ms-legend .alert-warning');
        expect(legendRuleElem).toBeTruthy();
        expect(legendRuleElem.innerText).toContain('layerProperties.interactiveLegend.incompatibleWFSFilterWarning');
        const resetLegendFilter = document.querySelector('.ms-legend .alert-warning button');
        expect(resetLegendFilter).toBeTruthy();
    });
    it('tests hide warning when layer filter is disabled', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wfs',
            url: 'http://localhost:8080/geoserver3/wfs',
            layerFilter: {
                filters: [{
                    id: INTERACTIVE_LEGEND_ID,
                    filters: [{
                        id: 'filter1'
                    }]
                }],
                disabled: true
            }
        };

        ReactDOM.render(<VectorLegend style={{format: 'geostyler', body: {rules: rules}}} layer={l} />, document.getElementById("container"));
        const legendElem = document.querySelector('.ms-legend');
        expect(legendElem).toBeTruthy();
        const legendRuleElem = document.querySelector('.ms-legend .alert-warning');
        expect(legendRuleElem).toBeFalsy();
    });
});
