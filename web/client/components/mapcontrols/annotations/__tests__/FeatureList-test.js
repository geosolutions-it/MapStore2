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
        expect(glyphIcons[5].className).toContain('ok-sign');
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
});
