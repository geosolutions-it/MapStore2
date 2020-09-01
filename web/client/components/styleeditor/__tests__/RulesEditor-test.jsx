/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import RulesEditorComponent from '../RulesEditor';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect';
import { DragDropContext as dragDropContext } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import Rule from '../Rule';

const RulesEditor = dragDropContext(testBackend)(RulesEditorComponent);

describe('RulesEditor', () => {
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
        ReactDOM.render(<RulesEditor />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });

    it('should render with mark symbolizer', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Mark rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Mark',
                            wellKnownName: 'Circle',
                            color: '#dddddd',
                            fillOpacity: 1,
                            strokeColor: '#777777',
                            strokeOpacity: 1,
                            strokeWidth: 1,
                            radius: 16,
                            rotate: 0
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();
        expect(legendLabelInput.value).toBe('Mark rule');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.shape',
            'styleeditor.fill',
            'styleeditor.strokeColor',
            'styleeditor.strokeWidth',
            'styleeditor.radius',
            'styleeditor.rotation'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.simpleStyle',
            'styleeditor.classificationStyle'
        ]);

    });

    it('should render with icon symbolizer', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Icon rule',
                        ruleId: 1,
                        symbolizers: [{
                            kind: 'Icon',
                            image: '',
                            opacity: 1,
                            size: 32,
                            rotate: 0
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();
        expect(legendLabelInput.value).toBe('Icon rule');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.image',
            'styleeditor.opacity',
            'styleeditor.size',
            'styleeditor.rotation'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect(optionsNodes.length).toBe(0);

    });

    it('should render with line symbolizer', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Line rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Line',
                            color: '#777777',
                            width: 1,
                            opacity: 1,
                            cap: 'round',
                            join: 'round'
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();
        expect(legendLabelInput.value).toBe('Line rule');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.strokeColor',
            'styleeditor.strokeWidth',
            'styleeditor.lineStyle',
            'styleeditor.lineCap',
            'styleeditor.lineJoin'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.simpleStyle',
            'styleeditor.classificationStyle',
            'styleeditor.patternMarkStyle',
            'styleeditor.patternIconStyle'
        ]);

    });

    it('should render with fill symbolizer', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Fill rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Fill',
                            color: '#dddddd',
                            fillOpacity: 1,
                            outlineColor: '#777777',
                            outlineWidth: 1
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();
        expect(legendLabelInput.value).toBe('Fill rule');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.fill',
            'styleeditor.outlineColor',
            'styleeditor.outlineWidth'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.simpleStyle',
            'styleeditor.classificationStyle',
            'styleeditor.patternMarkStyle',
            'styleeditor.patternIconStyle'
        ]);

    });

    it('should render with raster symbolizer', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Raster rule',
                        ruleId: 1,
                        symbolizers: [{
                            kind: 'Raster',
                            opacity: 1,
                            contrastEnhancement: {}
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();
        expect(legendLabelInput.value).toBe('Raster rule');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.grayChannel',
            'styleeditor.contrastEnhancement',
            'styleeditor.opacity'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.singleBand',
            'styleeditor.rgbaBands',
            'styleeditor.pseudoColor'
        ]);

    });

    it('should render with classification rule', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        kind: 'Classification',
                        name: 'Classification rule',
                        ruleId: 1,
                        classification: [],
                        intervals: 5,
                        method: 'equalInterval',
                        ramp: 'orrd',
                        reverse: false
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeFalsy();

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.colorRamp',
            'styleeditor.reverse',
            'styleeditor.attribute',
            'styleeditor.method',
            'styleeditor.intervals'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.simpleStyle',
            'styleeditor.classificationStyle'
        ]);

    });

    it('should render with raster classification rule', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        ruleId: 1,
                        kind: 'Raster',
                        opacity: 1,
                        classification: [],
                        intervals: 5,
                        method: 'equalInterval',
                        reverse: false,
                        continuous: true,
                        symbolizerKind: 'Raster'
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.grayChannel',
            'styleeditor.contrastEnhancement',
            'styleeditor.opacity',
            'styleeditor.colorRamp',
            'styleeditor.reverse',
            'styleeditor.continuous',
            'styleeditor.method',
            'styleeditor.intervals'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.singleBand',
            'styleeditor.rgbaBands',
            'styleeditor.pseudoColor'
        ]);

    });

    it('should render with filter tool', () => {
        ReactDOM.render(
            <RulesEditor
                config={{
                    attributes: [{
                        attribute: 'size',
                        label: 'size',
                        type: 'number'
                    }]
                }}
                rules={[
                    {
                        name: 'Fill rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Fill',
                            color: '#dddddd',
                            fillOpacity: 1,
                            outlineColor: '#777777',
                            outlineWidth: 1
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-filter',
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

    });


    it('should render symbolizer with mark pattern', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Fill pattern rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Fill',
                            graphicFill: {
                                kind: 'Mark',
                                wellKnownName: 'Circle',
                                color: '#dddddd',
                                fillOpacity: 1,
                                strokeColor: '#777777',
                                strokeOpacity: 1,
                                strokeWidth: 1,
                                radius: 16,
                                rotate: 0
                            },
                            fillOpacity: 1,
                            outlineColor: '#777777',
                            outlineWidth: 1
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();
        expect(legendLabelInput.value).toBe('Fill pattern rule');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.shape',
            'styleeditor.fill',
            'styleeditor.strokeColor',
            'styleeditor.strokeWidth',
            'styleeditor.radius',
            'styleeditor.rotation',
            'styleeditor.outlineColor',
            'styleeditor.outlineWidth'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.simpleStyle',
            'styleeditor.classificationStyle',
            'styleeditor.patternMarkStyle',
            'styleeditor.patternIconStyle'
        ]);

    });

    it('should render symbolizer with icon pattern', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Line pattern rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Line',
                            graphicStroke: {
                                kind: 'Icon',
                                image: '',
                                opacity: 1,
                                size: 32,
                                rotate: 0
                            },
                            width: 1,
                            opacity: 1,
                            cap: 'round',
                            join: 'round'
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();
        expect(legendLabelInput.value).toBe('Line pattern rule');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.image',
            'styleeditor.size',
            'styleeditor.strokeWidth',
            'styleeditor.lineStyle',
            'styleeditor.lineCap',
            'styleeditor.lineJoin'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.simpleStyle',
            'styleeditor.classificationStyle',
            'styleeditor.patternMarkStyle',
            'styleeditor.patternIconStyle'
        ]);

    });

    it('should trigger on change callback', (done) => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Icon rule',
                        ruleId: 1,
                        symbolizers: [{
                            kind: 'Icon',
                            image: '',
                            opacity: 1,
                            size: 32,
                            rotate: 0
                        }]
                    }
                ]}
                onChange={(newRules) => {
                    try {
                        expect(newRules[0].symbolizers[0].image).toBe('new-url');
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const inputNodes = symbolizersNode[0].querySelectorAll('input');
        expect(inputNodes.length).toBe(1);

        TestUtils.Simulate.change(inputNodes[0], { target: { value: 'new-url' }});
    });

    it('should trigger on update callback', (done) => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        kind: 'Classification',
                        name: 'Classification rule',
                        ruleId: 1,
                        classification: [],
                        intervals: 5,
                        method: 'equalInterval',
                        ramp: 'orrd',
                        reverse: false
                    }
                ]}
                onUpdate={(options) => {
                    try {
                        expect(options.values).toEqual({
                            reverse: true
                        });
                        expect(options.ruleId).toBe(1);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const buttonInputNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-value button');
        expect(buttonInputNodes.length).toBe(2);

        TestUtils.Simulate.click(buttonInputNodes[0]);
    });
    it('should trigger on change after sorting', (done) => {
        const root = ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Line rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Line',
                            color: '#777777',
                            width: 1,
                            opacity: 1,
                            cap: 'round',
                            join: 'round'
                        }]
                    },
                    {
                        name: 'Fill rule',
                        ruleId: 2,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Fill',
                            color: '#ff0000'
                        }]
                    }
                ]}
                onChange={(nreRules) => {
                    try {
                        expect(nreRules[0].ruleId).toBe(2);
                        expect(nreRules[1].ruleId).toBe(1);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));

        const backend = root.getManager().getBackend();
        const rulesTargets = TestUtils.scryRenderedComponentsWithType(root, Rule);
        expect(rulesTargets.length).toBe(2);
        // sources are nested inside the target using dragRuleSource
        const rulesSources = rulesTargets.map(ruleTarget => ruleTarget.getDecoratedComponentInstance());
        expect(rulesSources.length).toBe(2);
        backend.simulateBeginDrag([rulesSources[0].getHandlerId()], {
            clientOffset: { x: 0, y: 99999 },
            getSourceClientOffset: () => ({ x: 0, y: 99999 })
        });
        backend.simulateHover([rulesTargets[1].getHandlerId()]);
        backend.simulateEndDrag();
    });

    it('should render with text symbolizer', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Text rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Text',
                            color: '#dddddd',
                            label: 'Label'
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(1);

        const ruleHeadNode = rulesNode[0].querySelector('.ms-style-rule-head');

        const legendLabelInput = ruleHeadNode.querySelector('input');
        expect(legendLabelInput).toBeTruthy();
        expect(legendLabelInput.value).toBe('Text rule');

        const ruleHeadButtonNodes = ruleHeadNode.querySelectorAll('button');
        expect([...ruleHeadButtonNodes].map(btn => btn.children[0].getAttribute('class'))).toEqual([
            'glyphicon glyphicon-1-ruler',
            'glyphicon glyphicon-trash'
        ]);

        const symbolizersNode = rulesNode[0].querySelectorAll('.ms-symbolizer');
        expect(symbolizersNode.length).toBe(1);

        const symbolizerFields = symbolizersNode[0].querySelectorAll('.ms-symbolizer-label > span');
        expect([...symbolizerFields].map(field => field.innerHTML)).toEqual([
            'styleeditor.label',
            'styleeditor.fontFamily',
            'styleeditor.fontColor',
            'styleeditor.fontSize',
            'styleeditor.fontStyle',
            'styleeditor.fontWeight',
            'styleeditor.haloColor',
            'styleeditor.haloWidth',
            'styleeditor.rotation',
            'styleeditor.offsetX',
            'styleeditor.offsetY'
        ]);

        const optionsNodes = rulesNode[0].querySelectorAll('.ms-symbolizer-tools .dropdown-menu li a span');

        expect([...optionsNodes].map(field => field.innerHTML)).toEqual([
            'styleeditor.simpleStyle',
            'styleeditor.classificationStyle'
        ]);

    });

    it('should add warning to text symbolizer with index greater than zero', () => {
        ReactDOM.render(
            <RulesEditor
                rules={[
                    {
                        name: 'Text rule',
                        ruleId: 0,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Text',
                            color: '#dddddd',
                            label: 'Label'
                        }]
                    },
                    {
                        name: 'Text rule',
                        ruleId: 1,
                        symbolizers: [{
                            symbolizerId: 1,
                            kind: 'Text',
                            color: '#dddddd',
                            label: 'Label'
                        }]
                    }
                ]}
            />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();

        const rulesNode = document.querySelectorAll('.ms-style-rule');
        expect(rulesNode.length).toBe(2);

        let warningPopOverNode = rulesNode[0].querySelector('.mapstore-info-popover');
        expect(warningPopOverNode).toBeFalsy();

        warningPopOverNode = rulesNode[1].querySelector('.mapstore-info-popover');
        expect(warningPopOverNode).toBeTruthy();
    });

});

