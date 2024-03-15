/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Simulate } from 'react-dom/test-utils';
import { DragDropContext as dragDropContext } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import { FeaturesEditor as FeaturesEditorCmp } from '../FeaturesEditor';


const FeaturesEditor = dragDropContext(testBackend)(FeaturesEditorCmp);

describe('FeaturesEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<FeaturesEditor />, document.getElementById("container"));
        const editorNode = document.querySelector('.ms-features-editor');
        expect(editorNode).toBeTruthy();
    });
    it('should show list of valid features', () => {
        ReactDOM.render(<FeaturesEditor
            value={{
                features: [
                    {
                        id: 'feature-01',
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [0, 0] },
                        properties: { name: 'Point', annotationType: 'Point', id: 'feature-01' }
                    },
                    {
                        id: 'feature-02',
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [0, 0] },
                        properties: { name: 'Circle', annotationType: 'Circle', id: 'feature-02', radius: 100 }
                    },
                    {
                        id: 'feature-03',
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [0, 0] },
                        properties: { name: 'Text', annotationType: 'Text', id: 'feature-03', label: 'New' }
                    },
                    {
                        id: 'feature-04',
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
                        properties: { name: 'LineString', annotationType: 'LineString', id: 'feature-04' }
                    },
                    {
                        id: 'feature-05',
                        type: 'Feature',
                        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [0, 1], [0, 0]]] },
                        properties: { name: 'Polygon', annotationType: 'Polygon', id: 'feature-05' }
                    },
                    {
                        id: 'feature-06',
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
                        properties: { name: 'Length', measureType: 'length', annotationType: 'LineString', id: 'feature-06' }
                    },
                    {
                        id: 'feature-07',
                        type: 'Feature',
                        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [0, 1], [0, 0]]] },
                        properties: { name: 'Area', measureType: 'area', annotationType: 'Polygon', id: 'feature-07' }
                    },
                    {
                        id: 'feature-08',
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
                        properties: { name: 'Bearing', measureType: 'bearing', annotationType: 'LineString', id: 'feature-08' }
                    }
                ]
            }}
        />, document.getElementById("container"));
        const editorNode = document.querySelector('.ms-features-editor');
        expect(editorNode).toBeTruthy();
        const editorHeaderButtons = [...document.querySelectorAll('.ms-features-editor-list-header .btn')];
        expect(editorHeaderButtons.map((button) => button.querySelector('.glyphicon').getAttribute('class').replace('glyphicon glyphicon-', ''))).toEqual([
            'undo', 'redo', 'point-plus', 'polyline-plus', 'polygon-plus', 'font-add', '1-circle-add'
        ]);
        const featureEditorItem = [...document.querySelectorAll('.ms-features-editor-item')];
        expect(featureEditorItem.map((item) => [...item.querySelectorAll('.glyphicon')].map((node) => node.getAttribute('class').replace('glyphicon glyphicon-', ''))))
            .toEqual([
                [ 'point', 'ok-sign text-success', 'zoom-to', 'trash' ],
                [ '1-circle', 'ok-sign text-success', 'zoom-to', 'trash' ],
                [ 'font', 'ok-sign text-success', 'zoom-to', 'trash' ],
                [ 'polyline', 'ok-sign text-success', 'zoom-to', 'trash' ],
                [ 'polygon', 'ok-sign text-success', 'zoom-to', 'trash' ],
                [ '1-measure-length', 'ok-sign text-success', 'zoom-to', 'trash' ],
                [ '1-measure-area', 'ok-sign text-success', 'zoom-to', 'trash' ],
                [ '1-measure-bearing', 'ok-sign text-success', 'zoom-to', 'trash' ]
            ]);
    });
    it('should show add new features and trigger on change', (done) => {
        let count = 0;
        ReactDOM.render(<FeaturesEditor
            onChange={(options) => {
                if (count === 7) {
                    try {
                        expect(options.features.length).toBe(0);
                        expect(options.invalidFeatures.map(feature => feature.properties.annotationType)).toEqual(
                            [ 'Point', 'LineString', 'Polygon', 'Text', 'Circle' ]
                        );
                        done();
                    } catch (e) {
                        done(e);
                    }
                }
                count++;
            }}
        />, document.getElementById("container"));
        const editorNode = document.querySelector('.ms-features-editor');
        expect(editorNode).toBeTruthy();
        const editorHeaderButtons = [...document.querySelectorAll('.ms-features-editor-list-header .btn')];
        expect(editorHeaderButtons.map((button) => button.querySelector('.glyphicon').getAttribute('class').replace('glyphicon glyphicon-', ''))).toEqual([
            'undo', 'redo', 'point-plus', 'polyline-plus', 'polygon-plus', 'font-add', '1-circle-add'
        ]);
        Simulate.click(editorHeaderButtons[2]);
        Simulate.click(editorHeaderButtons[3]);
        Simulate.click(editorHeaderButtons[4]);
        Simulate.click(editorHeaderButtons[5]);
        Simulate.click(editorHeaderButtons[6]);
        Simulate.click(editorHeaderButtons[0]);
        Simulate.click(editorHeaderButtons[1]);
        const featureEditorItem = [...document.querySelectorAll('.ms-features-editor-item')];
        expect(featureEditorItem.map((item) => [...item.querySelectorAll('.glyphicon')].map((node) => node.getAttribute('class').replace('glyphicon glyphicon-', ''))))
            .toEqual([
                [ 'point', 'exclamation-mark text-danger', 'zoom-to', 'trash' ],
                [ 'polyline', 'exclamation-mark text-danger', 'zoom-to', 'trash' ],
                [ 'polygon', 'exclamation-mark text-danger', 'zoom-to', 'trash' ],
                [ 'font', 'exclamation-mark text-danger', 'zoom-to', 'trash' ],
                [ '1-circle', 'exclamation-mark text-danger', 'zoom-to', 'trash' ]
            ]);
    });
    it('should show coordinates and style tab when a feature is selected', (done) => {
        ReactDOM.render(<FeaturesEditor
            selectedId={'feature-01'}
            onSelectTab={(tab) => {
                try {
                    expect(tab).toBe('style');
                } catch (e) {
                    done(e);
                }
                done();
            }}
            value={{
                features: [{
                    id: 'feature-01',
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [0, 0] },
                    properties: { name: 'Point', annotationType: 'Point', id: 'feature-01' }
                }],
                style: {
                    format: 'geostyler',
                    body: {
                        name: '',
                        rules: [
                            {
                                ruleId: 'rule-01',
                                name: '',
                                filter: ['==', 'id', 'feature-01'],
                                symbolizers: [{
                                    symbolizerId: 'symbolizer-01',
                                    kind: 'Icon',
                                    image: {
                                        name: 'msMarkerIcon',
                                        args: [
                                            {
                                                color: 'blue',
                                                shape: 'circle',
                                                glyph: 'comment'
                                            }
                                        ]
                                    },
                                    opacity: 1,
                                    size: 46,
                                    rotate: 0,
                                    msBringToFront: false,
                                    anchor: 'bottom',
                                    msHeightReference: 'none'
                                }]
                            }
                        ]
                    }
                }
            }}
        />, document.getElementById("container"));
        const editorNode = document.querySelector('.ms-features-editor');
        expect(editorNode).toBeTruthy();
        const editorHeaderButtons = [...document.querySelectorAll('.ms-features-editor-list-header .btn')];
        expect(editorHeaderButtons.map((button) => button.querySelector('.glyphicon').getAttribute('class').replace('glyphicon glyphicon-', ''))).toEqual([
            'undo', 'redo', 'point-plus', 'polyline-plus', 'polygon-plus', 'font-add', '1-circle-add'
        ]);
        const featureEditorItem = [...document.querySelectorAll('.ms-features-editor-item.selected')];
        expect(featureEditorItem.map((item) => [...item.querySelectorAll('.glyphicon')].map((node) => node.getAttribute('class').replace('glyphicon glyphicon-', ''))))
            .toEqual([ [ 'point', 'ok-sign text-success', 'zoom-to', 'trash' ] ]);

        const navItems = [...document.querySelectorAll('.nav a')];
        expect(navItems.map(node => node.innerText)).toEqual([ 'annotations.tabCoordinates', 'annotations.tabStyle' ]);
        expect(document.querySelector('.coordinates-editor')).toBeTruthy();
        expect(document.querySelector('.ms-style-rules-editor')).toBeFalsy();
        Simulate.click(navItems[1]);
    });
});
