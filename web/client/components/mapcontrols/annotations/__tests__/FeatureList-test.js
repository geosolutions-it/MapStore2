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
            onZoom: () => {},
            onDeleteGeometry: () => {},
            setTabValue: () => {}
        };
        const spyOnSelectFeature = expect.spyOn(testHandlers, "onSelectFeature");
        const spyOnZoom = expect.spyOn(testHandlers, "onZoom");
        const spyOnDeleteGeometry = expect.spyOn(testHandlers, "onDeleteGeometry");
        ReactDOM.render(
            <FeaturesList editing={editing}
                onSelectFeature={testHandlers.onSelectFeature}
                onUnselectFeature={testHandlers.onUnselectFeature}
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
            onUnselectFeature: () => {}
        };
        const spyOnUnselectFeature = expect.spyOn(testHandlers, "onUnselectFeature");
        ReactDOM.render(<FeaturesList {...props} onUnselectFeature={testHandlers.onUnselectFeature}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();

        const featureCard = document.getElementsByClassName('geometry-card');
        expect(featureCard).toBeTruthy();

        // OnUnSelectFeature
        TestUtils.Simulate.click(featureCard[0]);
        expect(spyOnUnselectFeature).toHaveBeenCalled();
    });
});
