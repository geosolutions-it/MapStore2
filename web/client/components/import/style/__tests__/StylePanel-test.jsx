/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const StylePanel = require('../StylePanel');

const MY_JSON = require('../../../../test-resources/wfs/museam.json');
const L1 = { name: "L1", features: MY_JSON.features };
const L2 = { name: "L2" };
const W1 = { name: "TEST", "message": "M1" };
const Annotations = {name: "Annotations", features: [{type: "FeatureCollection", properties: {title: "Annotation 1"},
    features: [{type: "Feature", properties: {title: "Name1"},
        geometry: {type: "Point", coordinates: [12.481312562873996, 41.89790148509894]}}]}]};

describe('StylePanel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('StylePanel rendering with layers', () => {
        ReactDOM.render(<StylePanel layers={[L1, L2]} selected={L1} stylers={{"Point": <div></div>}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('h4')).toExist();
        const checkBoxes = [].slice.call(container.querySelectorAll('input[type=checkbox]'));
        expect(checkBoxes.length).toBe(2);
        expect(checkBoxes.filter(e => e.checked).length).toBe(1);
    });
    it('StylePanel rendering with annotation layers', () => {
        ReactDOM.render(<StylePanel layers={[Annotations]} selected={Annotations} stylers={{"Point": <div></div>}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('h4')).toExist();
        const radioButtons = [].slice.call(container.querySelectorAll('input[type=radio]'));
        const labels = [].slice.call(container.querySelectorAll('label'));
        expect(radioButtons.length).toBe(2);
        expect(radioButtons.filter(e => e.checked).length).toBe(1);
        expect(labels[0].innerText).toContain("merge");
        expect(radioButtons[0].checked).toBe(true);
        expect(radioButtons[1].checked).toBe(false);
        expect(labels[1].innerText).toContain("replace");
    });
    it('Test StylePanel for loadAnnotations to have been called on FINISH button click', (done) => {
        const actions = {
            onSuccess: () => {},
            loadAnnotations: () => {}
        };
        const onSuccessCallBack = expect.spyOn(actions, 'onSuccess');
        const loadAnnotationsCallBack = expect.spyOn(actions, 'loadAnnotations');

        const onLayerAdded = () => {
            expect(loadAnnotationsCallBack).toHaveBeenCalled();
            expect(onSuccessCallBack).toHaveBeenCalled();
            done();
        };

        const cmp = ReactDOM.render(
            <StylePanel shapeStyle={{marker: true}} errors={[W1]} layers={[Annotations]} selected={Annotations} stylers={{ "Point": <div></div> }}
                loadAnnotations={actions.loadAnnotations}
                onLayerAdded={onLayerAdded}
                onSuccess={actions.onSuccess} />, document.getElementById("container"));
        expect(cmp).toExist();
        let btn = document.querySelectorAll('button')[2];

        // Merge annotation layer (by default)
        ReactTestUtils.Simulate.click(btn); // <-- trigger event callback
        expect(loadAnnotationsCallBack.calls[0].arguments[0]).toExist();
        expect(loadAnnotationsCallBack.calls[0].arguments[1]).toBe(false);

        // Replace annotation layer
        const radioBtn = document.querySelectorAll('input[type=radio]')[1];
        ReactTestUtils.Simulate.change(radioBtn); // Click replace annotation layer
        expect(radioBtn.checked).toBe(true);
        ReactTestUtils.Simulate.click(btn);
        expect(loadAnnotationsCallBack.calls[1].arguments[0]).toExist();
        expect(loadAnnotationsCallBack.calls[1].arguments[1]).toBe(true);
    });
    it('StylePanel rendering with errors', () => {
        ReactDOM.render(<StylePanel errors={[W1]} layers={[L1, L2]} selected={L1} stylers={{ "Point": <div></div> }} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.alert')).toExist();
    });
    it('StylePanel rendering with success', () => {
        ReactDOM.render(<StylePanel success={"TEST"} layers={[L1, L2]} selected={L1} stylers={{ "Point": <div></div> }} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.alert')).toExist();
    });
    it('Test StylePanel onSuccess to have been called on NEXT / FINISH button click', (done) => {
        const actions = {
            onSuccess: () => {
            }
        };
        const spyCallBack = expect.spyOn(actions, 'onSuccess');

        const onLayerAdded = () => {
            expect(spyCallBack).toHaveBeenCalled();
            done();
        };

        const cmp = ReactDOM.render(<StylePanel shapeStyle={{marker: true}} errors={[W1]} layers={[L1, L2]} selected={L1} stylers={{ "Point": <div></div> }} onLayerAdded={onLayerAdded} onSuccess={actions.onSuccess} />, document.getElementById("container"));
        expect(cmp).toExist();
        const btn = document.querySelectorAll('button')[2];
        ReactTestUtils.Simulate.click(btn); // <-- trigger event callback
    });
    it('Test StylePanel onError to have been called on error during add', (done) => {
        const actions = {
            onSuccess: () => {
            },
            onLayerAdded: () => {throw new Error(); }
        };
        const spyCallBack = expect.spyOn(actions, 'onSuccess');
        const onError = () => {
            expect(spyCallBack).toHaveBeenCalled();
            done();
        };
        const cmp = ReactDOM.render(<StylePanel
            shapeStyle={{ marker: true }}
            errors={[W1]}
            layers={[L1, L2]}
            selected={L1}
            stylers={{ "Point": <div></div> }}
            onError={onError}
            onLayerAdded={actions.onLayerAdded}
            onSuccess={actions.onSuccess} />, document.getElementById("container"));
        expect(cmp).toExist();
        const btn = document.querySelectorAll('button')[2];
        ReactTestUtils.Simulate.click(btn); // <-- trigger event callback
    });
});
