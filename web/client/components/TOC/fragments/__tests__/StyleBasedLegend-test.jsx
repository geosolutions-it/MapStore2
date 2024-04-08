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
import StyleBasedLegend from '../StyleBasedLegend';

describe('StyleBasedLegend module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
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
        ReactDOM.render(<StyleBasedLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some Line');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-rule-legend-icon');
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
        ReactDOM.render(<StyleBasedLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some Line');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-rule-legend-icon');
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
        ReactDOM.render(<StyleBasedLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some Line');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-rule-legend-icon');
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
        ReactDOM.render(<StyleBasedLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some polygon');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-rule-legend-icon');
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
        ReactDOM.render(<StyleBasedLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule');
        expect(ruleElements.length).toBe(1);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('Some mark');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-rule-legend-icon');
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
        ReactDOM.render(<StyleBasedLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule');
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
        ReactDOM.render(<StyleBasedLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule');
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
        ReactDOM.render(<StyleBasedLegend style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule');
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerHTML).toBe('');
    });

    it('Should render interactive item for "Polygon" symbolizer', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        "name": ">= 159.055 and < 137771.05799999996",
                        "filter": [
                            "&&",
                            [
                                ">=",
                                "LAND_KM",
                                159.055
                            ],
                            [
                                "<",
                                "LAND_KM",
                                137771.05799999996
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
                        "name": ">= 137771.05799999996 and < 275383.0609999999",
                        "filter": [
                            "&&",
                            [
                                ">=",
                                "LAND_KM",
                                137771.05799999996
                            ],
                            [
                                "<",
                                "LAND_KM",
                                275383.0609999999
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
                    }
                ]
            }
        };
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wfs',
            url: 'http://localhost:8080/geoserver/wfs',
            enableInteractiveLegend: true
        };
        ReactDOM.render(<StyleBasedLegend layer={l} style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule.json-legend-rule');
        expect(ruleElements.length).toBe(2);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerText).toBe('>= 159.055 and < 137771.05799999996');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-rule-legend-icon');
        expect(iconContainerElement.length).toBe(1);
        expect(iconContainerElement[0].innerHTML).toExist();
    });

    it('Should render interactive item for "Line" symbolizer', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        "name": ">= 0.000145169491362 and < 4.969539144872505",
                        "filter": [
                            "&&",
                            [
                                ">=",
                                "l_mile",
                                0.000145169491362
                            ],
                            [
                                "<",
                                "l_mile",
                                4.969539144872505
                            ]
                        ],
                        "symbolizers": [
                            {
                                "kind": "Line",
                                "color": "#7f0000",
                                "width": 1,
                                "opacity": 1,
                                "cap": "round",
                                "join": "round",
                                "msClampToGround": true
                            }
                        ]
                    },
                    {
                        "name": ">= 4.969539144872505 and < 9.938933120253648",
                        "filter": [
                            "&&",
                            [
                                ">=",
                                "l_mile",
                                4.969539144872505
                            ],
                            [
                                "<",
                                "l_mile",
                                9.938933120253648
                            ]
                        ],
                        "symbolizers": [
                            {
                                "kind": "Line",
                                "color": "#d7301f",
                                "width": 1,
                                "opacity": 1,
                                "cap": "round",
                                "join": "round",
                                "msClampToGround": true
                            }
                        ]
                    }
                ]
            }
        };
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wfs',
            url: 'http://localhost:8080/geoserver/wfs',
            enableInteractiveLegend: true
        };
        ReactDOM.render(<StyleBasedLegend layer={l} style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule.json-legend-rule');
        expect(ruleElements.length).toBe(2);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerText).toBe('>= 0.000145169491362 and < 4.969539144872505');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-rule-legend-icon');
        expect(iconContainerElement.length).toBe(1);
        expect(iconContainerElement[0].innerHTML).toExist();
    });

    it('Should render interactive item for "Point" symbolizer', () => {
        const style = {
            format: 'geostyler',
            body: {
                rules: [
                    {
                        "name": ">= 487 and < 790.2",
                        "filter": [
                            "&&",
                            [
                                ">=",
                                "gid",
                                487
                            ],
                            [
                                "<",
                                "gid",
                                790.2
                            ]
                        ],
                        "symbolizers": [
                            {
                                "kind": "Mark",
                                "wellKnownName": "Circle",
                                "color": "#fff7ec",
                                "fillOpacity": 1,
                                "strokeColor": "#777777",
                                "strokeOpacity": 1,
                                "strokeWidth": 1,
                                "radius": 16,
                                "rotate": 0,
                                "msBringToFront": false,
                                "msHeightReference": "none"
                            }
                        ]
                    },
                    {
                        "name": ">= 790.2 and < 1093.4",
                        "filter": [
                            "&&",
                            [
                                ">=",
                                "gid",
                                790.2
                            ],
                            [
                                "<",
                                "gid",
                                1093.4
                            ]
                        ],
                        "symbolizers": [
                            {
                                "kind": "Mark",
                                "wellKnownName": "Circle",
                                "color": "#fdd49e",
                                "fillOpacity": 1,
                                "strokeColor": "#777777",
                                "strokeOpacity": 1,
                                "strokeWidth": 1,
                                "radius": 16,
                                "rotate": 0,
                                "msBringToFront": false,
                                "msHeightReference": "none"
                            }
                        ]
                    }
                ]
            }
        };
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wfs',
            url: 'http://localhost:8080/geoserver/wfs',
            enableInteractiveLegend: true
        };
        ReactDOM.render(<StyleBasedLegend layer={l} style={style} />, document.getElementById('container'));
        const ruleElements = document.querySelectorAll('.wfs-legend-rule.json-legend-rule');
        expect(ruleElements.length).toBe(2);
        const textElement = ruleElements[0].getElementsByTagName('span');
        expect(textElement[0].innerText).toBe('>= 487 and < 790.2');
        const iconContainerElement = ruleElements[0].querySelectorAll('.ms-rule-legend-icon');
        expect(iconContainerElement.length).toBe(1);
        expect(iconContainerElement[0].innerHTML).toExist();
    });
});
