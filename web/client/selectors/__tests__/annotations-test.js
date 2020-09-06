/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {isEmpty, isArray} = require('lodash');
const {
    annotationsLayerSelector,
    multiGeometrySelector,
    removingSelector,
    showUnsavedChangesModalSelector,
    showUnsavedStyleModalSelector,
    showUnsavedGeometryModalSelector,
    closingSelector,
    formatSelector,
    editingSelector,
    drawingSelector,
    stylerTypeSelector,
    drawingTextSelector,
    currentSelector,
    modeSelector,
    editedFieldsSelector,
    stylingSelector,
    unsavedChangesSelector,
    unsavedStyleSelector,
    unsavedGeometrySelector,
    errorsSelector,
    configSelector,
    aeronauticalOptionsSelector,
    annotationSelector,
    annotationsListSelector,
    symbolListSelector,
    editGeometrySelector
} = require("../annotations");

const state = {
    controls: {
        queryPanel: {
            enabled: true
        },
        wfsdownload: {
            available: true
        }
    },
    layers: {
        flat: [{
            id: 'undefined__5',
            group: 'background',
            source: 'ol',
            title: 'Empty Background',
            type: 'empty',
            visibility: false,
            singleTile: false,
            dimensions: [],
            hideLoading: false,
            handleClickOnLayer: false
        }, {
            id: 'annotations',
            features: [{
                type: 'Feature',
                properties: {
                    title: 'qe',
                    id: '051dc1f0-1004-11e8-b823-074c4aa21e05'
                },
                geometry: {
                    type: 'GeometryCollection',
                    geometries: [
                        {
                            type: 'MultiPoint',
                            coordinates: [
                                [
                                    -15.292055042255983,
                                    50.92290805089552
                                ]
                            ]
                        },
                        {
                            type: 'MultiPoint',
                            coordinates: [
                                [
                                    -8.260805042255983,
                                    50.25331169520629
                                ]
                            ]
                        },
                        {
                            type: 'MultiPoint',
                            coordinates: [
                                [
                                    -8.392640979755985,
                                    48.62469821211753
                                ]
                            ]
                        },
                        {
                            type: 'MultiPoint',
                            coordinates: [
                                [
                                    -11.600648792255985,
                                    47.12149867823992
                                ]
                            ]
                        }
                    ]
                },
                style: {
                    type: 'MultiPoint',
                    MultiPoint: {
                        iconColor: 'cyan',
                        iconShape: 'circle',
                        iconGlyph: 'comment'
                    },
                    Point: {
                        iconColor: 'cyan',
                        iconShape: 'circle',
                        iconGlyph: 'comment'
                    },
                    highlight: false
                }
            },
            {
                type: 'Feature',
                properties: {
                    title: 'multi geom with texts',
                    description: '<p>description of the annotation (<strong>only text here</strong>)</p>',
                    id: '14f738e0-1004-11e8-b823-074c4aa21e05',
                    textValues: [
                        'text annotation'
                    ],
                    textGeometriesIndexes: [
                        3
                    ]
                },
                geometry: {
                    type: 'GeometryCollection',
                    geometries: [
                        {
                            type: 'MultiPoint',
                            coordinates: [
                                [
                                    -15.116273792255985,
                                    43.85726130570702
                                ]
                            ]
                        },
                        {
                            type: 'MultiLineString',
                            coordinates: [
                                [
                                    [
                                        -12.611390979755985,
                                        41.26847014527159
                                    ],
                                    [
                                        -8.304750354755985,
                                        45.60534743757343
                                    ]
                                ]
                            ]
                        },
                        {
                            type: 'MultiPolygon',
                            coordinates: [
                                [
                                    [
                                        [
                                            -9.798890979755983,
                                            45.111286652123994
                                        ],
                                        [
                                            -14.281312854755985,
                                            40.37056482316976
                                        ],
                                        [
                                            -13.666078479755987,
                                            43.92060275549285
                                        ]
                                    ]
                                ]
                            ]
                        },
                        {
                            type: 'MultiPoint',
                            coordinates: [
                                [
                                    -16.742250354755985,
                                    42.41428591353268
                                ]
                            ]
                        }
                    ]
                },
                style: {
                    type: 'GeometryCollection',
                    MultiPoint: {
                        iconColor: 'pink',
                        iconShape: 'square',
                        iconGlyph: 'comment'
                    },
                    Point: {
                        iconColor: 'pink',
                        iconShape: 'square',
                        iconGlyph: 'comment'
                    },
                    MultiLineString: {
                        color: '#A033FF',
                        opacity: 1,
                        weight: 3,
                        fillColor: '#ffffff',
                        fillOpacity: 0.2,
                        editing: {
                            fill: 1
                        }
                    },
                    LineString: {
                        color: '#A033FF',
                        opacity: 1,
                        weight: 3,
                        fillColor: '#ffffff',
                        fillOpacity: 0.2,
                        editing: {
                            fill: 1
                        }
                    },
                    MultiPolygon: {
                        color: '#33FF99',
                        opacity: 1,
                        weight: 3,
                        fillColor: '#65D495',
                        fillOpacity: 0.2,
                        editing: {
                            fill: 1
                        }
                    },
                    Polygon: {
                        color: '#33FF99',
                        opacity: 1,
                        weight: 3,
                        fillColor: '#65D495',
                        fillOpacity: 0.2,
                        editing: {
                            fill: 1
                        }
                    },
                    Text: {
                        font: '14px Arial',
                        color: '#1726E6',
                        weight: 1,
                        opacity: 1
                    },
                    highlight: false
                }
            },
            {
                type: 'Feature',
                properties: {
                    title: 'ads',
                    id: '9b39c170-10c7-11e8-8bd1-5d54c2264561',
                    textValues: [
                        'asd'
                    ],
                    textGeometriesIndexes: [
                        0
                    ]
                },
                geometry: {
                    type: 'GeometryCollection',
                    geometries: [
                        {
                            type: 'MultiPoint',
                            coordinates: [
                                [
                                    -16.522523792255985,
                                    46.00359577260061
                                ]
                            ]
                        }
                    ]
                },
                style: {
                    type: 'GeometryCollection',
                    Text: {
                        fontStyle: 'normal',
                        fontSize: '21',
                        fontSizeUom: 'px',
                        fontFamily: 'Arial',
                        fontWeight: 'normal',
                        font: 'normal normal 21px Arial',
                        textAlign: 'center',
                        color: '#A424C0',
                        opacity: 1
                    },
                    highlight: false
                }
            }
            ],
            name: 'Annotations',
            style: {
                type: 'MultiPoint',
                MultiPoint: {
                    iconColor: 'cyan',
                    iconShape: 'circle',
                    iconGlyph: 'comment'
                },
                Point: {
                    iconColor: 'cyan',
                    iconShape: 'circle',
                    iconGlyph: 'comment'
                }
            },
            type: 'vector',
            visibility: true,
            singleTile: false,
            dimensions: [],
            hideLoading: true,
            handleClickOnLayer: true
        }
        ],
        groups: [
            {
                id: 'Default',
                title: 'Default',
                name: 'Default',
                nodes: [
                    'annotations'
                ],
                expanded: true
            }
        ]
    },
    annotations: {
        format: "decimal",
        config: {
            multiGeometry: true
        },
        current: '9b39c170-10c7-11e8-8bd1-5d54c2264561',
        editing: {
            type: 'Feature',
            properties: {
                title: 'ads',
                id: '9b39c170-10c7-11e8-8bd1-5d54c2264561',
                textValues: [
                    'asd',
                    'asdfafdsa',
                    'asdfafdsa'
                ],
                textGeometriesIndexes: [
                    0,
                    0,
                    1
                ]
            },
            geometry: {
                type: 'GeometryCollection',
                geometries: [
                    {
                        type: 'MultiPoint',
                        coordinates: [
                            [
                                -12.391664417255981,
                                45.82014261504604
                            ]
                        ]
                    },
                    {
                        type: 'MultiPoint',
                        coordinates: [
                            [
                                -22.367250354755985,
                                39.460534938478276
                            ]
                        ]
                    }
                ]
            },
            style: {
                type: 'GeometryCollection',
                Text: {
                    fontStyle: 'normal',
                    fontSize: '21',
                    fontSizeUom: 'px',
                    fontFamily: 'Arial',
                    fontWeight: 'normal',
                    font: 'normal normal 21px Arial',
                    textAlign: 'center',
                    color: '#A424C0',
                    opacity: 1
                },
                highlight: true
            }
        },
        removing: null,
        validationErrors: {},
        styling: true,
        drawing: true,
        filter: null,
        originalStyle: {
            type: 'GeometryCollection',
            Text: {
                fontStyle: 'normal',
                fontSize: '21',
                fontSizeUom: 'px',
                fontFamily: 'Arial',
                fontWeight: 'normal',
                font: 'normal normal 21px Arial',
                textAlign: 'center',
                color: '#A424C0',
                opacity: 1
            },
            highlight: false
        },
        stylerType: 'text',
        featureType: 'Text',
        drawingText: {
            show: false,
            drawing: false
        },
        unsavedChanges: true,
        showUnsavedChangesModal: false,
        showUnsavedStyleModal: false
    }
};

describe('Test annotations selectors', () => {
    it('test annotationsLayerSelector', () => {
        const retVal = annotationsLayerSelector(state);
        expect(retVal).toExist();
        expect(retVal.id).toBe("annotations");
    });
    it('test removingSelector', () => {
        const retVal = removingSelector(state);
        expect(retVal).toBe(null);
    });
    it('test multiGeometrySelector when it is set', () => {
        const multiGeometry = multiGeometrySelector(state);
        expect(multiGeometry).toBe(true);
    });
    it('test multiGeometrySelector when it is not set', () => {
        const multiGeometry = multiGeometrySelector({});
        expect(multiGeometry).toBe(false);
    });
    it('test showUnsavedChangesModalSelector', () => {
        const retVal = showUnsavedChangesModalSelector(state);
        expect(retVal).toBe(false);
    });
    it('test formatSelector', () => {
        const retVal = formatSelector(state);
        expect(retVal).toBe("decimal");
    });
    it('test showUnsavedStyleModalSelector', () => {
        const retVal = showUnsavedStyleModalSelector(state);
        expect(retVal).toBe(false);
    });
    it('test showUnsavedGeometryModalSelector', () => {
        let retVal = showUnsavedGeometryModalSelector(state);
        expect(retVal).toBe(false);

        retVal = showUnsavedGeometryModalSelector({annotations: {showUnsavedGeometryModal: true}});
        expect(retVal).toBe(true);
    });
    it('test closingSelector', () => {
        const retVal = closingSelector(state);
        expect(retVal).toBe(false);
    });
    it('test drawingSelector', () => {
        const retVal = drawingSelector(state);
        expect(retVal).toBe(true);
    });
    it('test editingSelector', () => {
        const retVal = editingSelector(state);
        expect(retVal.properties.id).toBe("9b39c170-10c7-11e8-8bd1-5d54c2264561");
    });
    it('test currentSelector', () => {
        const retVal = currentSelector(state);
        expect(retVal).toBe("9b39c170-10c7-11e8-8bd1-5d54c2264561");
    });
    it('test drawingTextSelector', () => {
        const retVal = drawingTextSelector(state);
        expect(retVal.show).toBe(false);
        expect(retVal.drawing).toBe(false);
    });
    it('test stylerTypeSelector', () => {
        const retVal = stylerTypeSelector(state);
        expect(retVal).toBe("text");
    });
    it('test modeSelector', () => {
        const retVal = modeSelector(state);
        expect(retVal).toBe("editing");
    });
    it('test editedFieldsSelector', () => {
        const retVal = editedFieldsSelector(state);
        expect(isEmpty(retVal)).toBe(true);
    });
    it('test stylingSelector', () => {
        const retVal = stylingSelector(state);
        expect(retVal).toBe(true);
    });
    it('test unsavedChangesSelector', () => {
        const retVal = unsavedChangesSelector(state);
        expect(retVal).toBe(true);
    });
    it('test unsavedStyleSelector', () => {
        const retVal = unsavedStyleSelector(state);
        expect(retVal).toBe(false);
    });
    it('test unsavedGeometrySelector', () => {
        let retVal = unsavedGeometrySelector(state);
        expect(retVal).toBe(false);
        retVal = unsavedGeometrySelector({annotations: {unsavedGeometry: true}});
        expect(retVal).toBe(true);
    });
    it('test errorsSelector', () => {
        const retVal = errorsSelector(state);
        expect(isEmpty(retVal)).toBe(true);
    });
    it('test configSelector', () => {
        const retVal = configSelector(state);
        expect(isEmpty(retVal)).toBe(false);
        expect(retVal.multiGeometry).toBe(true);
    });
    it('test annotationSelector', () => {
        const retVal = annotationSelector(state);
        expect(isEmpty(retVal)).toBe(false);
        expect(retVal.annotation.properties.id).toBe("9b39c170-10c7-11e8-8bd1-5d54c2264561");
    });
    it('test annotationsListSelector', () => {
        const retVal = annotationsListSelector(state);
        expect(retVal.removing).toBe(null);
        expect(retVal.filter).toBe('');
    });
    it('test aeronauticalOptionsSelector', () => {
        const retVal = aeronauticalOptionsSelector(state);
        expect(retVal).toBe(undefined);
    });
    it('test aeronauticalOptionsSelector with true value', () => {
        const retVal = aeronauticalOptionsSelector({annotations: {aeronauticalOptions: true}});
        expect(retVal).toBe(true);
    });
    it('test symbolListSelector ', () => {
        let retVal = symbolListSelector({annotations: {}});
        expect(isArray(retVal)).toBe(true);
        expect(retVal.length).toBe(0);

        const symbolList = [{name: "symbolName"}];
        retVal = symbolListSelector({annotations: {symbolList}});
        expect(isArray(retVal)).toBe(true);
        expect(retVal.length).toBe(symbolList.length);
    });

    it('modeSelector', () => {
        // list mode
        expect(modeSelector({
            annotations: { editing: false }
        })).toBe('list');
        // editing mode
        expect(modeSelector({
            annotations: {editing: true}
        })).toBe('editing');

        // detail mode
        expect(modeSelector({
            layers: {
                flat: [{id: 'annotations'}]
            },
            annotations: {
                current: true
            }
        })).toBe('detail');

        // list mode if annotations layer is not present and editing deactivated
        expect(modeSelector({
            layers: {
                flat: [{ id: 'OTHER_LAYER' }]
            },
            annotations: {
                current: true
            }
        })).toBe('list');
    });

    it('annotationsListSelector', () => {
        // list mode
        expect(annotationsListSelector({
            annotations: { editing: false }
        }).mode).toBe('list');
        // editing mode
        expect(annotationsListSelector({
            annotations: { editing: true }
        }).mode).toBe('editing');

        // detail mode
        expect(annotationsListSelector({
            layers: {
                flat: [{ id: 'annotations' }]
            },
            annotations: {
                current: true
            }
        }).mode).toBe('detail');

        // list mode if annotations layer is not present and editing deactivated
        expect(annotationsListSelector({
            layers: {
                flat: [{ id: 'OTHER_LAYER' }]
            },
            annotations: {
                current: true
            }
        }).mode).toBe('list');
    });
    it('editGeometrySelector', () => {
        // Edit geometry
        expect(editGeometrySelector({
            annotations: {editGeometry: false}
        })).toBe(false);
        // Default edit geometry
        expect(editGeometrySelector({
            annotations: {}
        })).toBe(true);
    });
});
