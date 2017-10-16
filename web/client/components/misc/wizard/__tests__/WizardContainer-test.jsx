/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');

const expect = require('expect');
const WizardContainer = require('../WizardContainer');
describe('WizardContainer component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('WizardContainer rendering with defaults', () => {
        ReactDOM.render(<WizardContainer />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
    });
    it('WizardContainer rendering with 1 step', () => {
        ReactDOM.render(<WizardContainer><div id="step-1"></div></WizardContainer>, document.getElementById("container"));
        const container = document.getElementById('container');
        const step1 = container.querySelector('#step-1');
        expect(step1).toExist();
        const prev = container.querySelector('.ms-wizard-prev');
        expect(prev).toNotExist();
        const next = container.querySelector('.ms-wizard-next');
        expect(next).toNotExist();
        const finish = container.querySelector('.ms-wizard-finish');
        expect(finish).toExist();
    });
    it('WizardContainer rendering with 2 step', () => {
        ReactDOM.render(<WizardContainer><div id="step-1"></div><div id="step-2"></div></WizardContainer>, document.getElementById("container"));
        let container = document.getElementById('container');
        let step1 = container.querySelector('#step-1');
        expect(step1).toExist();
        let step2 = container.querySelector('#step-2');
        expect(step2).toNotExist();
        let prev = container.querySelector('.ms-wizard-prev');
        expect(prev).toNotExist();
        let next = container.querySelector('.ms-wizard-next');
        expect(next).toExist();
        let finish = container.querySelector('.ms-wizard-finish');
        expect(finish).toNotExist();
        ReactDOM.render(<WizardContainer step={1}><div id="step-1"></div><div id="step-2"></div></WizardContainer>, document.getElementById("container"));
        container = document.getElementById('container');
        step1 = container.querySelector('#step-1');
        expect(step1).toNotExist();
        step2 = container.querySelector('#step-2');
        expect(step2).toExist();
        prev = container.querySelector('.ms-wizard-prev');
        expect(prev).toExist();
        next = container.querySelector('.ms-wizard-next');
        expect(next).toNotExist();
        finish = container.querySelector('.ms-wizard-finish');
        expect(finish).toExist();
    });
    it('WizardContainer rendering hide buttons', () => {
        ReactDOM.render(<WizardContainer hideButtons><div id="step-1"></div></WizardContainer>, document.getElementById("container"));
        const container = document.getElementById('container');
        const step1 = container.querySelector('#step-1');
        expect(step1).toExist();
        const prev = container.querySelector('.ms-wizard-prev');
        expect(prev).toNotExist();
        const next = container.querySelector('.ms-wizard-next');
        expect(next).toNotExist();
        const finish = container.querySelector('.ms-wizard-finish');
        expect(finish).toNotExist();
    });
    it('Test WizardContainer onNextPage', () => {
        const actions = {
            nextPage: () => {}
        };
        const spynextPage = expect.spyOn(actions, 'nextPage');
        ReactDOM.render(<WizardContainer onNextPage={actions.nextPage} ><div id="step-1">STEP1</div><div id="step-2">STEP2</div></WizardContainer>, document.getElementById("container"));
        const container = document.getElementById('container');
        const next = container.querySelector('.ms-wizard-next');
        expect(next).toExist();
        ReactTestUtils.Simulate.click(next);
        expect(spynextPage).toHaveBeenCalled();
    });
    it('Test WizardContainer onPrevPage', () => {
        const actions = {
            prevPage: () => {}
        };
        const spyPrevPage = expect.spyOn(actions, 'prevPage');
        ReactDOM.render(<WizardContainer step={1} onPrevPage={actions.prevPage} ><div id="step-1">STEP1</div><div id="step-2">STEP2</div></WizardContainer>, document.getElementById("container"));
        const container = document.getElementById('container');
        const prev = container.querySelector('.ms-wizard-prev');
        expect(prev).toExist();
        ReactTestUtils.Simulate.click(prev);
        expect(spyPrevPage).toHaveBeenCalled();
    });
    it('Test WizardContainer onFinish', () => {
        const actions = {
            onFinish: () => {}
        };
        const spyOnFinish = expect.spyOn(actions, 'onFinish');
        ReactDOM.render(<WizardContainer step={1} onFinish={actions.onFinish} ><div id="step-1">STEP1</div><div id="step-2">STEP2</div></WizardContainer>, document.getElementById("container"));
        const container = document.getElementById('container');
        const finish = container.querySelector('.ms-wizard-finish');
        expect(finish).toExist();
        ReactTestUtils.Simulate.click(finish);
        expect(spyOnFinish).toHaveBeenCalled();
    });
    it('Test WizardContainer nested components calls', () => {
        const Step1 = ({onNextPage = () => {}}) => <div onClick={() => onNextPage()} id="step-1">STEP1</div>;
        const Step2 = ({onPrevPage = () => {}}) => <div onClick={() => onPrevPage()} id="step-2">STEP1</div>;
        const actions = {
            nextPage: () => {},
            prevPage: () => {}
        };
        const spynextPage = expect.spyOn(actions, 'nextPage');
        const spyPrevPage = expect.spyOn(actions, 'prevPage');
        ReactDOM.render(<WizardContainer onNextPage={actions.nextPage} onPrevPage={actions.prevPage}><Step1 /><Step2 /></WizardContainer>, document.getElementById("container"));
        const container = document.getElementById('container');
        const step1 = container.querySelector('#step-1');
        expect(step1).toExist();
        ReactTestUtils.Simulate.click(step1);
        expect(spynextPage).toHaveBeenCalled();
        ReactDOM.render(<WizardContainer step={1} onNextPage={actions.nextPage} onPrevPage={actions.prevPage} ><Step1 /><Step2 /></WizardContainer>, document.getElementById("container"));
        const step2 = container.querySelector('#step-2');
        expect(step2).toExist();
        ReactTestUtils.Simulate.click(step2);
        expect(spyPrevPage).toHaveBeenCalled();
    });
});
