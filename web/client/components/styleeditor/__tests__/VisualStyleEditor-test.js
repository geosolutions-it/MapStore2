/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import expect from 'expect';
import { DragDropContext as dragDropContext } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import ReactDOM from 'react-dom';
import { Simulate, act } from 'react-dom/test-utils';

import { waitFor } from '@testing-library/react';
import VisualStyleEditorComponent from '../VisualStyleEditor';

const VisualStyleEditor = dragDropContext(testBackend)(VisualStyleEditorComponent);

describe('VisualStyleEditor', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults', () => {
        ReactDOM.render(<VisualStyleEditor />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });
    it('should trigger on change when parser and code are available', (done) => {
        ReactDOM.render(<VisualStyleEditor
            format="css"
            code={`
                    @mode 'Flat';

                    * {
                        fill: #ff0000;
                    }`}
            onChange={(newCode) => {
                try {
                    expect(newCode).toBeTruthy();
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });
    it('should use default JSON style if available', (done) => {
        ReactDOM.render(<VisualStyleEditor
            format="css"
            code={`
                    @mode 'Flat';

                    * {
                        fill: #ff0000;
                    }`}
            defaultStyleJSON={{
                name: '',
                rules: [{
                    name: '',
                    symbolizers: [{
                        kind: 'Fill',
                        color: '#00ff00'
                    }]
                }]
            }}
            onChange={(newCode, styleJSON) => {
                try {
                    expect(styleJSON.rules[0].symbolizers[0].color).toBe('#00ff00');
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });
    it('should throw an error if the parser is not available', (done) => {
        ReactDOM.render(<VisualStyleEditor
            format="unknow"
            code="unknow style format"
            onError={(error) => {
                try {
                    expect(error).toEqual({ messageId: 'styleeditor.formatNotSupported', status: 400 });
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });
    it('should throw an error when all style are removed', (done) => {
        const DEBOUNCE_TIME = 1;
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="css"
                code="* { fill: #ff0000; }"
                debounceTime={DEBOUNCE_TIME}
                onError={(error) => {
                    try {
                        expect(error).toEqual({ messageId: 'styleeditor.styleEmpty', status: 400, isEmpty: true });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
        setTimeout(() => {
            try {
                const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
                expect(ruleEditorNode).toBeTruthy();
                const buttonNodes = document.querySelectorAll('button');
                expect([...buttonNodes].map(node => node.children[0].getAttribute('class'))).toEqual([
                    'glyphicon glyphicon-undo',
                    'glyphicon glyphicon-redo',
                    'glyphicon glyphicon-trash',
                    'glyphicon glyphicon-option-vertical'
                ]);
                act(() => {
                    Simulate.click(buttonNodes[2]);
                });
            } catch (e) {
                done(e);
            }
        }, DEBOUNCE_TIME * 10);
    });
    it('should throw an error when rule has an error', (done) => {
        const DEBOUNCE_TIME = 1;
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="css"
                code="* { fill: #ff0000; }"
                defaultStyleJSON={{
                    rules: [
                        {
                            name: '',
                            symbolizers: [
                                {
                                    kind: 'Fill',
                                    color: '#ff0000'
                                }
                            ]
                        },
                        {
                            errorId: 'ruleErrorId'
                        }
                    ]
                }}
                debounceTime={DEBOUNCE_TIME}
                onError={(error) => {
                    try {
                        expect(error).toEqual({ messageId: 'ruleErrorId', status: 400 });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
    });
    it('should throw an error when classification rule is incomplete', (done) => {
        const DEBOUNCE_TIME = 1;
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="css"
                code="* { fill: #ff0000; }"
                defaultStyleJSON={{
                    rules: [
                        {
                            name: '',
                            symbolizers: [
                                {
                                    kind: 'Fill',
                                    color: '#ff0000'
                                }
                            ]
                        },
                        {
                            kind: 'Classification'
                        }
                    ]
                }}
                debounceTime={DEBOUNCE_TIME}
                onError={(error) => {
                    try {
                        expect(error).toEqual({ messageId: 'styleeditor.incompleteClassification', status: 400 });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
    });
    it('should throw an error when icon symbolizer has image undefined', (done) => {
        const DEBOUNCE_TIME = 1;
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="css"
                code="* { fill: #ff0000; }"
                defaultStyleJSON={{
                    rules: [
                        {
                            name: '',
                            symbolizers: [
                                {
                                    kind: 'Icon',
                                    image: undefined
                                }
                            ]
                        }
                    ]
                }}
                debounceTime={DEBOUNCE_TIME}
                onError={(error) => {
                    try {
                        expect(error).toEqual({ messageId: 'styleeditor.imageSrcEmpty', status: 400 });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
    });
    it('should throw an error when icon symbolizer has image with no format', (done) => {
        const DEBOUNCE_TIME = 1;
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="sld"
                code={"<?xml"}
                defaultStyleJSON={{
                    name: "Base SLD1",
                    rules: [
                        {
                            name: "",
                            ruleId: "1",
                            symbolizers: [
                                {
                                    kind: "Icon",
                                    image: "https://test.com/linktoImage",
                                    opacity: 1,
                                    size: 32,
                                    rotate: 0,
                                    symbolizerId: "2"
                                }
                            ]
                        }
                    ]
                }}
                debounceTime={DEBOUNCE_TIME}
                onError={(error) => {
                    try {
                        expect(error).toEqual({ messageId: 'styleeditor.imageFormatEmpty', status: 400 });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
    });
    it('should disable undo and redo when history is empty', () => {
        ReactDOM.render(<VisualStyleEditor
            format="3dtiles"
            code={{
                color: 'color(\'#ff0000\')'
            }}
            defaultStyleJSON={null}
        />, document.getElementById('container'));
        const disabledButtons = document.querySelectorAll('.disabled');
        expect([...disabledButtons].map(node => node.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-undo',
            'glyphicon glyphicon-redo'
        ]);
    });
    it('should disable add model symbolizer when enable3dStyleOptions is false', () => {
        ReactDOM.render(<VisualStyleEditor
            format="geostyler"
            geometryType="vector"
            code={{ name: '', rules: [] }}
            enable3dStyleOptions={false}
            defaultStyleJSON={null}
            exactMatchGeometrySymbol
            config={{
                simple: true,
                fonts: []
            }}
            debounceTime={1}
        />, document.getElementById('container'));
        const disabledButtons = document.querySelectorAll('.ms-style-rules-editor-right button.disabled');
        expect([...disabledButtons].map(node => node.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-model-plus'
        ]);
    });
    it('should disable mark symbolizer properties when enable3dStyleOptions is false and not undefined', (done) => {
        const styleBody = {
            "name": "",
            "rules": [
                {
                    "name": "",
                    "ruleId": "1",
                    "symbolizers": [
                        {
                            "kind": "Mark",
                            "wellKnownName": "Star",
                            "color": "#ffe500",
                            "fillOpacity": 1,
                            "strokeColor": "#050505",
                            "strokeOpacity": 1,
                            "strokeWidth": 2,
                            "radius": 19,
                            "rotate": 0,
                            "msBringToFront": true,
                            "msHeightReference": "none",
                            "symbolizerId": "1",
                            "msHeight": {
                                "type": "attribute",
                                "name": "height"
                            }
                        }
                    ]
                }
            ]
        };
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="geostyler"
                code={styleBody}
                enable3dStyleOptions={false}
                geometryType="vector"
                defaultStyleJSON={styleBody}
                exactMatchGeometrySymbol
                config={{
                    simple: true,
                    fonts: []
                }}
                debounceTime={1}
            />, document.getElementById('container'));
        });
        waitFor(() => expect(document.querySelector('.ms-style-rule')).toBeTruthy())
            .then(() => {
                const disabledFields = document.querySelectorAll('.ms-symbolizer-field-disabled .ms-symbolizer-label span');
                expect([...disabledFields].map(node => node.innerHTML)).toEqual([
                    'styleeditor.msBringToFront',
                    'styleeditor.heightReferenceFromGround',
                    'styleeditor.height',
                    'styleeditor.leaderLineColor',
                    'styleeditor.leaderLineWidth'
                ]);
                done();
            }).catch(done);
    });
    it('should disable icon symbolizer properties when enable3dStyleOptions is false and not undefined', (done) => {
        const styleBody = {
            "name": "",
            "rules": [
                {
                    "name": "",
                    "ruleId": "1",
                    "symbolizers": [
                        {
                            "kind": "Icon",
                            "image": "http://path/to/img.png",
                            "opacity": 1,
                            "size": 32,
                            "rotate": 0,
                            "msBringToFront": false,
                            "msHeightReference": "none",
                            "symbolizerId": "1"
                        }
                    ]
                }
            ]
        };
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="geostyler"
                code={styleBody}
                enable3dStyleOptions={false}
                geometryType="vector"
                defaultStyleJSON={styleBody}
                exactMatchGeometrySymbol
                config={{
                    simple: true,
                    fonts: []
                }}
                debounceTime={1}
            />, document.getElementById('container'));
        });
        waitFor(() => expect(document.querySelector('.ms-style-rule')).toBeTruthy())
            .then(() => {
                const disabledFields = document.querySelectorAll('.ms-symbolizer-field-disabled .ms-symbolizer-label span');
                expect([...disabledFields].map(node => node.innerHTML)).toEqual([
                    'styleeditor.msBringToFront',
                    'styleeditor.heightReferenceFromGround',
                    'styleeditor.height',
                    'styleeditor.leaderLineColor',
                    'styleeditor.leaderLineWidth'
                ]);
                done();
            }).catch(done);
    });
    it('should disable text symbolizer properties when enable3dStyleOptions is false and not undefined', (done) => {
        const styleBody = {
            "name": "",
            "rules": [
                {
                    "name": "",
                    "ruleId": "1",
                    "symbolizers": [
                        {
                            "kind": "Text",
                            "color": "#333333",
                            "size": 14,
                            "fontStyle": "normal",
                            "fontWeight": "normal",
                            "haloColor": "#ffffff",
                            "haloWidth": 1,
                            "allowOverlap": true,
                            "offset": [
                                0,
                                0
                            ],
                            "msBringToFront": false,
                            "msHeightReference": "none",
                            "symbolizerId": "1",
                            "label": "{{name}}",
                            "font": [
                                "Arial"
                            ]
                        }
                    ]
                }
            ]
        };
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="geostyler"
                code={styleBody}
                enable3dStyleOptions={false}
                geometryType="vector"
                defaultStyleJSON={styleBody}
                exactMatchGeometrySymbol
                config={{
                    simple: true,
                    fonts: ["Arial"]
                }}
                debounceTime={1}
            />, document.getElementById('container'));
        });
        waitFor(() => expect(document.querySelector('.ms-style-rule')).toBeTruthy())
            .then(() => {
                const disabledFields = document.querySelectorAll('.ms-symbolizer-field-disabled .ms-symbolizer-label span');
                expect([...disabledFields].map(node => node.innerHTML)).toEqual([
                    'styleeditor.msBringToFront',
                    'styleeditor.heightReferenceFromGround',
                    'styleeditor.height',
                    'styleeditor.leaderLineColor',
                    'styleeditor.leaderLineWidth'
                ]);
                done();
            }).catch(done);
    });
    it('should disable model symbolizer properties when enable3dStyleOptions is false and not undefined', (done) => {
        const styleBody = {
            "name": "",
            "rules": [
                {
                    "name": "",
                    "ruleId": "1",
                    "symbolizers": [
                        {
                            "kind": "Model",
                            "model": "https://path/to/model.glb",
                            "scale": 3,
                            "color": "#ffffff",
                            "opacity": 1,
                            "msHeightReference": "none",
                            "symbolizerId": "1",
                            "msHeight": 0,
                            "heading": 67
                        }
                    ]
                }
            ]
        };
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="geostyler"
                code={styleBody}
                enable3dStyleOptions={false}
                geometryType="vector"
                defaultStyleJSON={styleBody}
                exactMatchGeometrySymbol
                config={{
                    simple: true,
                    fonts: []
                }}
                debounceTime={1}
            />, document.getElementById('container'));
        });
        waitFor(() => expect(document.querySelector('.ms-style-rule')).toBeTruthy())
            .then(() => {
                const disabledFields = document.querySelectorAll('.ms-symbolizer-field-disabled .ms-symbolizer-label span');
                expect([...disabledFields].map(node => node.innerHTML)).toEqual([
                    'styleeditor.model',
                    'styleeditor.scale',
                    'styleeditor.pitch',
                    'styleeditor.roll',
                    'styleeditor.heading',
                    'styleeditor.color',
                    'styleeditor.heightReferenceFromGround',
                    'styleeditor.height',
                    'styleeditor.leaderLineColor',
                    'styleeditor.leaderLineWidth'
                ]);
                done();
            }).catch(done);
    });
    it('should disable line symbolizer properties when enable3dStyleOptions is false and not undefined', (done) => {
        const styleBody = {
            "name": "",
            "rules": [
                {
                    "name": "",
                    "symbolizers": [
                        {
                            "kind": "Line",
                            "color": "#252525",
                            "opacity": 1,
                            "width": 1,
                            "symbolizerId": "1",
                            "dasharray": [
                                8,
                                8
                            ],
                            "msClampToGround": false
                        }
                    ],
                    "ruleId": "1"
                }
            ]
        };
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="geostyler"
                code={styleBody}
                enable3dStyleOptions={false}
                geometryType="vector"
                defaultStyleJSON={styleBody}
                exactMatchGeometrySymbol
                config={{
                    simple: true,
                    fonts: []
                }}
                debounceTime={1}
            />, document.getElementById('container'));
        });
        waitFor(() => expect(document.querySelector('.ms-style-rule')).toBeTruthy())
            .then(() => {
                const disabledFields = document.querySelectorAll('.ms-symbolizer-field-disabled .ms-symbolizer-label span');
                expect([...disabledFields].map(node => node.innerHTML)).toEqual([ 'styleeditor.clampToGround' ]);
                done();
            }).catch(done);
    });
    it('should disable line symbolizer properties when enable3dStyleOptions is true and not undefined', (done) => {
        const styleBody = {
            "name": "",
            "rules": [
                {
                    "name": "",
                    "symbolizers": [
                        {
                            "kind": "Line",
                            "color": "#252525",
                            "opacity": 1,
                            "width": 1,
                            "symbolizerId": "1",
                            "dasharray": [
                                8,
                                8
                            ],
                            "msClampToGround": false
                        }
                    ],
                    "ruleId": "1"
                }
            ]
        };
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="geostyler"
                code={styleBody}
                enable3dStyleOptions
                geometryType="vector"
                defaultStyleJSON={styleBody}
                exactMatchGeometrySymbol
                config={{
                    simple: true,
                    fonts: []
                }}
                debounceTime={1}
            />, document.getElementById('container'));
        });
        waitFor(() => expect(document.querySelector('.ms-style-rule')).toBeTruthy())
            .then(() => {
                const disabledFields = document.querySelectorAll('.ms-symbolizer-field-disabled .ms-symbolizer-label span');
                expect([...disabledFields].map(node => node.innerHTML)).toEqual([
                    'styleeditor.lineCap',
                    'styleeditor.lineJoin'
                ]);
                done();
            }).catch(done);
    });
    it('should disable fill symbolizer properties when enable3dStyleOptions is false and not undefined', (done) => {
        const styleBody = {
            "name": "",
            "rules": [
                {
                    "name": "",
                    "symbolizers": [
                        {
                            "kind": "Fill",
                            "color": "#ff8e00",
                            "opacity": 0.1,
                            "fillOpacity": 0.63,
                            "symbolizerId": "1",
                            "msClassificationType": "terrain"
                        }
                    ],
                    "ruleId": "1"
                }
            ]
        };
        act(() => {
            ReactDOM.render(<VisualStyleEditor
                format="geostyler"
                code={styleBody}
                enable3dStyleOptions={false}
                geometryType="vector"
                defaultStyleJSON={styleBody}
                exactMatchGeometrySymbol
                config={{
                    simple: true,
                    fonts: []
                }}
                debounceTime={1}
            />, document.getElementById('container'));
        });
        waitFor(() => expect(document.querySelector('.ms-style-rule')).toBeTruthy())
            .then(() => {
                const disabledFields = document.querySelectorAll('.ms-symbolizer-field-disabled .ms-symbolizer-label span');
                expect([...disabledFields].map(node => node.innerHTML)).toEqual([
                    'styleeditor.clampOutlineToGround',
                    'styleeditor.classificationtype'
                ]);
                done();
            }).catch(done);
    });

});
