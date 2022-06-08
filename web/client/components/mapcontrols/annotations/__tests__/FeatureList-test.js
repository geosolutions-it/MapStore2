/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import FeaturesList from '../FeaturesList';

import TestUtils from 'react-dom/test-utils';

describe("test FeatureList component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test render FeaturesList', () => {
        ReactDOM.render(<FeaturesList/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
    });

    it('test render with default properties', () => {
        ReactDOM.render(<FeaturesList/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const labels = container.querySelectorAll(".control-label");
        expect(labels[0].innerText).toBe('annotations.geometries');
        const buttons = container.querySelectorAll("button");
        expect(buttons.length).toBe(5);
        expect(container.innerText).toContain('annotations.addGeometry');
    });

    it('test render with measurement annotation properties', () => {
        ReactDOM.render(<FeaturesList isMeasureEditDisabled={false}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const buttons = container.querySelectorAll("button");
        expect(buttons.length).toBe(1);
    });
    it('test geometries toolbar', () => {
        const editing = {
            features: [{
                properties: {id: '1', isValidFeature: true, geometryTitle: 'Polygon'},
                geometry: {type: "Polygon"}
            }]
        };
        const actions = {
            onAddGeometry: () => {},
            onSetStyle: () => {},
            onStyleGeometry: () => {},
            onStartDrawing: () => {},
            onAddText: () => {}
        };
        const defaultStyle = {POINT: {
            marker: ["Test marker"],
            symbol: ["Test symbol"]
        }};
        const spyOnAddGeometry = expect.spyOn(actions, "onAddGeometry");
        const spyOnSetStyle = expect.spyOn(actions, "onSetStyle");
        const spyOnStyleGeometry = expect.spyOn(actions, "onStyleGeometry");
        const spyOnStartDrawing = expect.spyOn(actions, "onStartDrawing");
        const spyOnAddText = expect.spyOn(actions, "onAddText");
        ReactDOM.render(<FeaturesList editing={editing}
            defaultStyles={defaultStyle}
            defaultPointType={'symbol'}
            onAddGeometry={actions.onAddGeometry}
            onSetStyle={actions.onSetStyle}
            onStyleGeometry={actions.onStyleGeometry}
            onStartDrawing={actions.onStartDrawing}
            onAddText={actions.onAddText}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();

        const geometriesToolbar = document.querySelector('.geometries-toolbar');
        const buttons = geometriesToolbar.children[1].getElementsByTagName('button');
        [...buttons].forEach((btn, index)=>{
            TestUtils.Simulate.click(btn);
            expect(spyOnSetStyle).toHaveBeenCalled();
            if (index === 0) {
                const [style] = spyOnSetStyle.calls[0].arguments[0];
                expect(style["0"]).toEqual('Test symbol');
            }
            index === 3 && expect(spyOnAddText).toHaveBeenCalled();
            expect(spyOnAddGeometry).toHaveBeenCalled();
            expect(spyOnStartDrawing).toHaveBeenCalled();
            expect(spyOnStyleGeometry).toHaveBeenCalled();
        });
    });
    it('test render with feature card', () => {
        const editing = {
            features: [{
                properties: {id: '1', isValidFeature: true, geometryTitle: 'Polygon'},
                geometry: {type: "Polygon"}
            }]
        };
        ReactDOM.render(<FeaturesList editing={editing}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();

        const cardContainer = document.getElementsByClassName('geometry-card');
        expect(cardContainer).toBeTruthy();

        const previewIcon = document.querySelector('.glyphicon-polygon');
        expect(previewIcon).toBeTruthy();

        const cardTitle = document.querySelector('.geometry-card-label');
        expect(cardTitle.innerText).toBe('Polygon');

        const glyphIcons = document.querySelectorAll('.btn-group .glyphicon');
        expect(glyphIcons.length).toBe(8);
        expect(glyphIcons[6].className).toContain('zoom-to');
        expect(glyphIcons[7].className).toContain('trash');
    });

    it('test actions on feature card', () => {
        const editing = {
            features: [{
                type: "Feature",
                properties: {id: '1', isValidFeature: true, geometryTitle: 'Polygon'},
                geometry: {type: "Polygon", coordinates: [
                    [
                        [-121.07812513411045, 42.11778385718358],
                        [-116.2265622317791, 44.72175879125132],
                        [-115.87499973177908, 40.773885871584866],
                        [-114.96093589067458, 42.68889580392076],
                        [-121.07812513411045, 42.11778385718358]
                    ]
                ]}
            }]
        };
        const testHandlers = {
            onSelectFeature: () => {},
            onUnselectFeature: () => {},
            onStyleGeometry: () => {},
            onZoom: () => {},
            onDeleteGeometry: () => {},
            setTabValue: () => {}
        };
        const spyOnSelectFeature = expect.spyOn(testHandlers, "onSelectFeature");
        const spyOnZoom = expect.spyOn(testHandlers, "onZoom");
        const spyOnDeleteGeometry = expect.spyOn(testHandlers, "onDeleteGeometry");
        const spyOnStyleGeometry = expect.spyOn(testHandlers, "onStyleGeometry");
        ReactDOM.render(
            <FeaturesList editing={editing}
                onSelectFeature={testHandlers.onSelectFeature}
                onUnselectFeature={testHandlers.onUnselectFeature}
                onStyleGeometry={testHandlers.onStyleGeometry}
                onZoom={testHandlers.onZoom}
                onDeleteGeometry={testHandlers.onDeleteGeometry}
                setTabValue={testHandlers.setTabValue}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();

        const featureCard = document.getElementsByClassName('geometry-card');
        expect(featureCard).toBeTruthy();

        const buttons = document.querySelectorAll('button');

        // OnSelectFeature
        TestUtils.Simulate.click(featureCard[0]);
        expect(spyOnSelectFeature).toHaveBeenCalled();
        expect(spyOnSelectFeature.calls[0].arguments[0]).toEqual(editing.features);
        expect(spyOnStyleGeometry).toHaveBeenCalled();
        expect(spyOnStyleGeometry.calls[0].arguments[0]).toBe(false);

        // OnZoomGeometry
        TestUtils.Simulate.click(buttons[5]);
        expect(spyOnZoom).toHaveBeenCalled();
        expect(spyOnZoom.calls[0].arguments[1]).toBe("EPSG:4326");

        // OnDeleteGeometry
        TestUtils.Simulate.click(buttons[6]);
        expect(spyOnDeleteGeometry).toHaveBeenCalled();
        expect(spyOnDeleteGeometry.calls[0].arguments[0]).toBe("1");
    });

    it('test unselect a geometry', () => {
        const props = {
            editing: {
                features: [{
                    type: "Feature",
                    properties: {id: '1', isValidFeature: true, geometryTitle: 'Polygon'},
                    geometry: {type: "Polygon"}
                }]
            },
            selected: {properties: {id: '1'}}
        };
        const testHandlers = {
            onUnselectFeature: () => {},
            onGeometryHighlight: () => {}
        };
        const spyOnUnselectFeature = expect.spyOn(testHandlers, "onUnselectFeature");
        const spyOnGeometryHighlight = expect.spyOn(testHandlers, "onGeometryHighlight");
        ReactDOM.render(<FeaturesList {...props} onUnselectFeature={testHandlers.onUnselectFeature} onGeometryHighlight={testHandlers.onGeometryHighlight}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();

        const featureCard = document.getElementsByClassName('geometry-card');
        expect(featureCard).toBeTruthy();

        // OnUnSelectFeature
        TestUtils.Simulate.click(featureCard[0]);
        expect(spyOnUnselectFeature).toHaveBeenCalled();
        expect(spyOnGeometryHighlight).toHaveBeenCalled();
        expect(spyOnGeometryHighlight.calls[0].arguments[0]).toBe('1');
    });

    it('test geometry highlight', () => {
        let props = {
            editing: {
                features: [{
                    type: "Feature",
                    properties: {id: '1', isValidFeature: true, geometryTitle: 'Polygon'},
                    geometry: {type: "Polygon"}
                }]
            },
            selected: {properties: {id: '1'}}
        };
        const testHandlers = {
            onGeometryHighlight: () => {}
        };
        const spyOnGeometryHighlight = expect.spyOn(testHandlers, "onGeometryHighlight");
        ReactDOM.render(<FeaturesList {...props} onGeometryHighlight={testHandlers.onGeometryHighlight}/>, document.getElementById("container"));
        let container = document.getElementById('container');
        expect(container).toBeTruthy();

        let featureCard = document.getElementsByClassName('geometry-card');
        expect(featureCard).toBeTruthy();

        TestUtils.Simulate.mouseEnter(featureCard[0]);
        expect(spyOnGeometryHighlight).toNotHaveBeenCalled();

        // When geometry card is not selected
        props = {...props, selected: {...props.selected, properties: {id: 2}}};
        ReactDOM.render(<FeaturesList {...props} onGeometryHighlight={testHandlers.onGeometryHighlight}/>, document.getElementById("container"));
        container = document.getElementById('container');
        featureCard = document.getElementsByClassName('geometry-card');
        // OnMouseEnter
        TestUtils.Simulate.mouseEnter(featureCard[0]);
        expect(spyOnGeometryHighlight).toHaveBeenCalled();
        expect(spyOnGeometryHighlight.calls[0].arguments[0]).toBe('1');

        // OnMouseLeave
        TestUtils.Simulate.mouseLeave(featureCard[0]);
        expect(spyOnGeometryHighlight).toHaveBeenCalled();
        expect(spyOnGeometryHighlight.calls[1].arguments[0]).toBe('1');
        expect(spyOnGeometryHighlight.calls[1].arguments[1]).toBe(false);
    });

    it('test geometry highlight limitations', () => {
        let props = {
            editing: {
                features: [{
                    type: "Feature",
                    properties: {id: '1', isValidFeature: false, geometryTitle: 'Polygon'},
                    geometry: {type: "Polygon"}
                }]
            },
            selected: {properties: {id: '2', isValidFeature: false}}
        };
        const testHandlers = {
            onGeometryHighlight: () => {}
        };
        const spyOnGeometryHighlight = expect.spyOn(testHandlers, "onGeometryHighlight");
        ReactDOM.render(<FeaturesList {...props} onGeometryHighlight={testHandlers.onGeometryHighlight}/>, document.getElementById("container"));
        let container = document.getElementById('container');
        expect(container).toBeTruthy();

        let featureCard = document.getElementsByClassName('geometry-card');
        expect(featureCard).toBeTruthy();

        ReactDOM.render(<FeaturesList {...props} onGeometryHighlight={testHandlers.onGeometryHighlight}/>, document.getElementById("container"));
        container = document.getElementById('container');
        featureCard = document.getElementsByClassName('geometry-card');
        // OnMouseEnter
        TestUtils.Simulate.mouseEnter(featureCard[0]);
        expect(spyOnGeometryHighlight).toNotHaveBeenCalled();

        // OnMouseLeave
        TestUtils.Simulate.mouseLeave(featureCard[0]);
        expect(spyOnGeometryHighlight).toNotHaveBeenCalled();
    });

    it('test render defaults with defaultPointType as symbol', () => {
        ReactDOM.render(<FeaturesList defaultPointType={'symbol'}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const labels = container.querySelectorAll(".control-label");
        expect(labels[0].innerText).toBe('annotations.geometries');
        const buttons = container.querySelectorAll("button");
        expect(buttons.length).toBe(5);
        expect(container.innerText).toContain('annotations.addGeometry');
    });

    it('test render geometries list with invalid feature selected', () => {
        const editing = {
            type: 'FeatureCollection',
            id: 'test',
            geometry: null,
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        coordinates: [
                            2,
                            2
                        ],
                        type: 'Point'
                    },
                    properties: {
                        id: 'valid_point_1',
                        isValidFeature: true,
                        canEdit: false,
                        isText: true,
                        valueText: 'New'
                    },
                    style: []
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [
                                    -103.81796836853027,
                                    44.46559348908588
                                ],
                                [
                                    -103.81703110829551,
                                    44.46552760470746
                                ],
                                [
                                    -103.81612987259096,
                                    44.465332483907986
                                ],
                                [
                                    -103.81529930060866,
                                    44.46501562631259
                                ],
                                [
                                    -103.81457131424438,
                                    44.46458921044
                                ],
                                [
                                    -103.81397389082737,
                                    44.46406962540589
                                ],
                                [
                                    -103.8135299877814,
                                    44.46347684076437
                                ],
                                [
                                    -103.81325666057009,
                                    44.46283363875544
                                ],
                                [
                                    -103.81316440779548,
                                    44.46216473851325
                                ],
                                [
                                    -103.81325676853575,
                                    44.461495845934785
                                ],
                                [
                                    -103.81353018727592,
                                    44.46085266575033
                                ],
                                [
                                    -103.81397415147958,
                                    44.46025991377149
                                ],
                                [
                                    -103.81457159637228,
                                    44.45974036726561
                                ],
                                [
                                    -103.81529956126083,
                                    44.45931398992131
                                ],
                                [
                                    -103.81613007208553,
                                    44.45899716498863
                                ],
                                [
                                    -103.8170312162612,
                                    44.45880206601363
                                ],
                                [
                                    -103.81796836853027,
                                    44.458736189298946
                                ],
                                [
                                    -103.81890552079936,
                                    44.45880206601363
                                ],
                                [
                                    -103.81980666497502,
                                    44.45899716498863
                                ],
                                [
                                    -103.82063717579967,
                                    44.45931398992131
                                ],
                                [
                                    -103.82136514068827,
                                    44.45974036726561
                                ],
                                [
                                    -103.82196258558098,
                                    44.46025991377149
                                ],
                                [
                                    -103.82240654978459,
                                    44.46085266575033
                                ],
                                [
                                    -103.82267996852477,
                                    44.461495845934785
                                ],
                                [
                                    -103.82277232926502,
                                    44.46216473851325
                                ],
                                [
                                    -103.82268007649044,
                                    44.46283363875544
                                ],
                                [
                                    -103.82240674927917,
                                    44.46347684076437
                                ],
                                [
                                    -103.82196284623315,
                                    44.46406962540589
                                ],
                                [
                                    -103.82136542281614,
                                    44.46458921044
                                ],
                                [
                                    -103.82063743645189,
                                    44.46501562631259
                                ],
                                [
                                    -103.81980686446954,
                                    44.465332483907986
                                ],
                                [
                                    -103.81890562876504,
                                    44.46552760470746
                                ],
                                [
                                    -103.81796836853027,
                                    44.46559348908588
                                ]
                            ]
                        ]
                    },
                    properties: {
                        isCircle: true,
                        radius: 381.249,
                        center: [
                            -103.81796836853027,
                            44.46216483919243
                        ],
                        id: 'circle',
                        crs: 'EPSG:3857',
                        isGeodesic: true,
                        polygonGeom: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [
                                        -103.81796836853027,
                                        44.46559348908588
                                    ],
                                    [
                                        -103.81703110829551,
                                        44.46552760470746
                                    ],
                                    [
                                        -103.81612987259096,
                                        44.465332483907986
                                    ],
                                    [
                                        -103.81529930060866,
                                        44.46501562631259
                                    ],
                                    [
                                        -103.81457131424438,
                                        44.46458921044
                                    ],
                                    [
                                        -103.81397389082737,
                                        44.46406962540589
                                    ],
                                    [
                                        -103.8135299877814,
                                        44.46347684076437
                                    ],
                                    [
                                        -103.81325666057009,
                                        44.46283363875544
                                    ],
                                    [
                                        -103.81316440779548,
                                        44.46216473851325
                                    ],
                                    [
                                        -103.81325676853575,
                                        44.461495845934785
                                    ],
                                    [
                                        -103.81353018727592,
                                        44.46085266575033
                                    ],
                                    [
                                        -103.81397415147958,
                                        44.46025991377149
                                    ],
                                    [
                                        -103.81457159637228,
                                        44.45974036726561
                                    ],
                                    [
                                        -103.81529956126083,
                                        44.45931398992131
                                    ],
                                    [
                                        -103.81613007208553,
                                        44.45899716498863
                                    ],
                                    [
                                        -103.8170312162612,
                                        44.45880206601363
                                    ],
                                    [
                                        -103.81796836853027,
                                        44.458736189298946
                                    ],
                                    [
                                        -103.81890552079936,
                                        44.45880206601363
                                    ],
                                    [
                                        -103.81980666497502,
                                        44.45899716498863
                                    ],
                                    [
                                        -103.82063717579967,
                                        44.45931398992131
                                    ],
                                    [
                                        -103.82136514068827,
                                        44.45974036726561
                                    ],
                                    [
                                        -103.82196258558098,
                                        44.46025991377149
                                    ],
                                    [
                                        -103.82240654978459,
                                        44.46085266575033
                                    ],
                                    [
                                        -103.82267996852477,
                                        44.461495845934785
                                    ],
                                    [
                                        -103.82277232926502,
                                        44.46216473851325
                                    ],
                                    [
                                        -103.82268007649044,
                                        44.46283363875544
                                    ],
                                    [
                                        -103.82240674927917,
                                        44.46347684076437
                                    ],
                                    [
                                        -103.82196284623315,
                                        44.46406962540589
                                    ],
                                    [
                                        -103.82136542281614,
                                        44.46458921044
                                    ],
                                    [
                                        -103.82063743645189,
                                        44.46501562631259
                                    ],
                                    [
                                        -103.81980686446954,
                                        44.465332483907986
                                    ],
                                    [
                                        -103.81890562876504,
                                        44.46552760470746
                                    ],
                                    [
                                        -103.81796836853027,
                                        44.46559348908588
                                    ]
                                ]
                            ]
                        },
                        isValidFeature: true,
                        canEdit: false
                    },
                    style: []
                },
                {
                    type: 'Feature',
                    geometry: {
                        coordinates: [
                            [
                                1,
                                1
                            ],
                            [
                                2,
                                2
                            ],
                            [
                                3,
                                3
                            ]
                        ],
                        type: 'LineString'
                    },
                    properties: {
                        id: 'line',
                        isValidFeature: true,
                        canEdit: false
                    },
                    style: [
                        {
                            color: '#ffcc33',
                            opacity: 1,
                            weight: 3,
                            editing: {
                                fill: 1
                            },
                            highlight: false,
                            id: 'a254f3e0-e727-11ec-b07d-23973f4534bb'
                        },
                        {
                            iconGlyph: 'comment',
                            iconShape: 'square',
                            iconColor: 'blue',
                            highlight: false,
                            iconAnchor: [
                                0.5,
                                0.5
                            ],
                            type: 'Point',
                            title: 'StartPoint Style',
                            geometry: 'startPoint',
                            filtering: false,
                            id: 'a1e39470-e727-11ec-b07d-23973f4534bb'
                        },
                        {
                            iconGlyph: 'comment',
                            iconShape: 'square',
                            iconColor: 'blue',
                            highlight: false,
                            iconAnchor: [
                                0.5,
                                0.5
                            ],
                            type: 'Point',
                            title: 'EndPoint Style',
                            geometry: 'endPoint',
                            filtering: false,
                            id: 'a1e39471-e727-11ec-b07d-23973f4534bb'
                        }
                    ]
                },
                {
                    type: 'Feature',
                    geometry: {
                        coordinates: [
                            1,
                            1
                        ],
                        type: 'Point'
                    },
                    properties: {
                        id: 'valid_point',
                        isValidFeature: true,
                        canEdit: false,
                        isPoint: true
                    },
                    style: []
                },
                {
                    type: 'Feature',
                    geometry: {
                        coordinates: [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    2,
                                    2
                                ]
                            ]
                        ],
                        type: 'Polygon'
                    },
                    properties: {
                        id: 'ploygon',
                        isValidFeature: false,
                        canEdit: false
                    },
                    style: [
                        {
                            color: '#ffcc33',
                            opacity: 1,
                            weight: 3,
                            fillColor: '#ffffff',
                            fillOpacity: 0.2,
                            editing: {
                                fill: 1
                            },
                            highlight: false,
                            id: 'cd1ea080-e727-11ec-b07d-23973f4534bb'
                        }
                    ]
                },
                {
                    type: 'Feature',
                    geometry: null,
                    properties: {
                        id: 'point',
                        isValidFeature: false,
                        canEdit: false,
                        isPoint: true
                    },
                    style: [
                        {
                            iconGlyph: 'comment',
                            iconShape: 'square',
                            iconColor: 'blue',
                            highlight: false,
                            id: 'd09eeda0-e727-11ec-b07d-23973f4534bb'
                        }
                    ]
                }
            ],
            newFeature: true,
            properties: {
                id: '9a6e8d80-e727-11ec-b07d-23973f4534bb'
            }
        };

        const selected = {
            type: 'Feature',
            geometry: null,
            properties: {
                id: 'point',
                isValidFeature: false,
                canEdit: true,
                isPoint: true
            },
            style: []
        };

        ReactDOM.render(<FeaturesList editing={editing} selected={selected} defaultPointType={'symbol'}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const selectedCard = container.querySelectorAll(".ms-selected");
        const disabledCards = container.querySelectorAll(".ms-disabled");
        expect(selectedCard.length).toBe(1);
        expect(disabledCards.length).toBe(5);
    });

    it('test render geometries list with invalid feature selected', () => {
        const editing = {
            type: 'FeatureCollection',
            id: 'test',
            geometry: null,
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        coordinates: [
                            2,
                            2
                        ],
                        type: 'Point'
                    },
                    properties: {
                        id: 'valid_point_1',
                        isValidFeature: true,
                        canEdit: false,
                        isText: true,
                        valueText: 'New'
                    },
                    style: []
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [
                                    -103.81796836853027,
                                    44.46559348908588
                                ],
                                [
                                    -103.81703110829551,
                                    44.46552760470746
                                ],
                                [
                                    -103.81612987259096,
                                    44.465332483907986
                                ],
                                [
                                    -103.81529930060866,
                                    44.46501562631259
                                ],
                                [
                                    -103.81457131424438,
                                    44.46458921044
                                ],
                                [
                                    -103.81397389082737,
                                    44.46406962540589
                                ],
                                [
                                    -103.8135299877814,
                                    44.46347684076437
                                ],
                                [
                                    -103.81325666057009,
                                    44.46283363875544
                                ],
                                [
                                    -103.81316440779548,
                                    44.46216473851325
                                ],
                                [
                                    -103.81325676853575,
                                    44.461495845934785
                                ],
                                [
                                    -103.81353018727592,
                                    44.46085266575033
                                ],
                                [
                                    -103.81397415147958,
                                    44.46025991377149
                                ],
                                [
                                    -103.81457159637228,
                                    44.45974036726561
                                ],
                                [
                                    -103.81529956126083,
                                    44.45931398992131
                                ],
                                [
                                    -103.81613007208553,
                                    44.45899716498863
                                ],
                                [
                                    -103.8170312162612,
                                    44.45880206601363
                                ],
                                [
                                    -103.81796836853027,
                                    44.458736189298946
                                ],
                                [
                                    -103.81890552079936,
                                    44.45880206601363
                                ],
                                [
                                    -103.81980666497502,
                                    44.45899716498863
                                ],
                                [
                                    -103.82063717579967,
                                    44.45931398992131
                                ],
                                [
                                    -103.82136514068827,
                                    44.45974036726561
                                ],
                                [
                                    -103.82196258558098,
                                    44.46025991377149
                                ],
                                [
                                    -103.82240654978459,
                                    44.46085266575033
                                ],
                                [
                                    -103.82267996852477,
                                    44.461495845934785
                                ],
                                [
                                    -103.82277232926502,
                                    44.46216473851325
                                ],
                                [
                                    -103.82268007649044,
                                    44.46283363875544
                                ],
                                [
                                    -103.82240674927917,
                                    44.46347684076437
                                ],
                                [
                                    -103.82196284623315,
                                    44.46406962540589
                                ],
                                [
                                    -103.82136542281614,
                                    44.46458921044
                                ],
                                [
                                    -103.82063743645189,
                                    44.46501562631259
                                ],
                                [
                                    -103.81980686446954,
                                    44.465332483907986
                                ],
                                [
                                    -103.81890562876504,
                                    44.46552760470746
                                ],
                                [
                                    -103.81796836853027,
                                    44.46559348908588
                                ]
                            ]
                        ]
                    },
                    properties: {
                        isCircle: true,
                        radius: 381.249,
                        center: [
                            -103.81796836853027,
                            44.46216483919243
                        ],
                        id: 'circle',
                        crs: 'EPSG:3857',
                        isGeodesic: true,
                        polygonGeom: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [
                                        -103.81796836853027,
                                        44.46559348908588
                                    ],
                                    [
                                        -103.81703110829551,
                                        44.46552760470746
                                    ],
                                    [
                                        -103.81612987259096,
                                        44.465332483907986
                                    ],
                                    [
                                        -103.81529930060866,
                                        44.46501562631259
                                    ],
                                    [
                                        -103.81457131424438,
                                        44.46458921044
                                    ],
                                    [
                                        -103.81397389082737,
                                        44.46406962540589
                                    ],
                                    [
                                        -103.8135299877814,
                                        44.46347684076437
                                    ],
                                    [
                                        -103.81325666057009,
                                        44.46283363875544
                                    ],
                                    [
                                        -103.81316440779548,
                                        44.46216473851325
                                    ],
                                    [
                                        -103.81325676853575,
                                        44.461495845934785
                                    ],
                                    [
                                        -103.81353018727592,
                                        44.46085266575033
                                    ],
                                    [
                                        -103.81397415147958,
                                        44.46025991377149
                                    ],
                                    [
                                        -103.81457159637228,
                                        44.45974036726561
                                    ],
                                    [
                                        -103.81529956126083,
                                        44.45931398992131
                                    ],
                                    [
                                        -103.81613007208553,
                                        44.45899716498863
                                    ],
                                    [
                                        -103.8170312162612,
                                        44.45880206601363
                                    ],
                                    [
                                        -103.81796836853027,
                                        44.458736189298946
                                    ],
                                    [
                                        -103.81890552079936,
                                        44.45880206601363
                                    ],
                                    [
                                        -103.81980666497502,
                                        44.45899716498863
                                    ],
                                    [
                                        -103.82063717579967,
                                        44.45931398992131
                                    ],
                                    [
                                        -103.82136514068827,
                                        44.45974036726561
                                    ],
                                    [
                                        -103.82196258558098,
                                        44.46025991377149
                                    ],
                                    [
                                        -103.82240654978459,
                                        44.46085266575033
                                    ],
                                    [
                                        -103.82267996852477,
                                        44.461495845934785
                                    ],
                                    [
                                        -103.82277232926502,
                                        44.46216473851325
                                    ],
                                    [
                                        -103.82268007649044,
                                        44.46283363875544
                                    ],
                                    [
                                        -103.82240674927917,
                                        44.46347684076437
                                    ],
                                    [
                                        -103.82196284623315,
                                        44.46406962540589
                                    ],
                                    [
                                        -103.82136542281614,
                                        44.46458921044
                                    ],
                                    [
                                        -103.82063743645189,
                                        44.46501562631259
                                    ],
                                    [
                                        -103.81980686446954,
                                        44.465332483907986
                                    ],
                                    [
                                        -103.81890562876504,
                                        44.46552760470746
                                    ],
                                    [
                                        -103.81796836853027,
                                        44.46559348908588
                                    ]
                                ]
                            ]
                        },
                        isValidFeature: true,
                        canEdit: false
                    },
                    style: []
                },
                {
                    type: 'Feature',
                    geometry: {
                        coordinates: [
                            [
                                1,
                                1
                            ],
                            [
                                2,
                                2
                            ],
                            [
                                3,
                                3
                            ]
                        ],
                        type: 'LineString'
                    },
                    properties: {
                        id: 'line',
                        isValidFeature: true,
                        canEdit: false
                    },
                    style: [
                        {
                            color: '#ffcc33',
                            opacity: 1,
                            weight: 3,
                            editing: {
                                fill: 1
                            },
                            highlight: false,
                            id: 'a254f3e0-e727-11ec-b07d-23973f4534bb'
                        },
                        {
                            iconGlyph: 'comment',
                            iconShape: 'square',
                            iconColor: 'blue',
                            highlight: false,
                            iconAnchor: [
                                0.5,
                                0.5
                            ],
                            type: 'Point',
                            title: 'StartPoint Style',
                            geometry: 'startPoint',
                            filtering: false,
                            id: 'a1e39470-e727-11ec-b07d-23973f4534bb'
                        },
                        {
                            iconGlyph: 'comment',
                            iconShape: 'square',
                            iconColor: 'blue',
                            highlight: false,
                            iconAnchor: [
                                0.5,
                                0.5
                            ],
                            type: 'Point',
                            title: 'EndPoint Style',
                            geometry: 'endPoint',
                            filtering: false,
                            id: 'a1e39471-e727-11ec-b07d-23973f4534bb'
                        }
                    ]
                },
                {
                    type: 'Feature',
                    geometry: {
                        coordinates: [
                            1,
                            1
                        ],
                        type: 'Point'
                    },
                    properties: {
                        id: 'valid_point',
                        isValidFeature: true,
                        canEdit: false,
                        isPoint: true
                    },
                    style: []
                },
                {
                    type: 'Feature',
                    geometry: {
                        coordinates: [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    2,
                                    2
                                ]
                            ]
                        ],
                        type: 'Polygon'
                    },
                    properties: {
                        id: 'ploygon',
                        isValidFeature: false,
                        canEdit: false
                    },
                    style: [
                        {
                            color: '#ffcc33',
                            opacity: 1,
                            weight: 3,
                            fillColor: '#ffffff',
                            fillOpacity: 0.2,
                            editing: {
                                fill: 1
                            },
                            highlight: false,
                            id: 'cd1ea080-e727-11ec-b07d-23973f4534bb'
                        }
                    ]
                },
                {
                    type: 'Feature',
                    geometry: null,
                    properties: {
                        id: 'point',
                        isValidFeature: false,
                        canEdit: false,
                        isPoint: true
                    },
                    style: [
                        {
                            iconGlyph: 'comment',
                            iconShape: 'square',
                            iconColor: 'blue',
                            highlight: false,
                            id: 'd09eeda0-e727-11ec-b07d-23973f4534bb'
                        }
                    ]
                }
            ],
            newFeature: true,
            properties: {
                id: '9a6e8d80-e727-11ec-b07d-23973f4534bb'
            }
        };

        ReactDOM.render(<FeaturesList editing={editing} defaultPointType={'symbol'}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const selectedCard = container.querySelectorAll(".ms-selected");
        const disabledCards = container.querySelectorAll(".ms-disabled");
        expect(selectedCard.length).toBe(0);
        expect(disabledCards.length).toBe(0);
    });
});
