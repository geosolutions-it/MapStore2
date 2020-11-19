/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import {wizardHandlers} from '../enhancers';
import WizardContainerComp from '../WizardContainer';

const WizardContainer = wizardHandlers(WizardContainerComp);

describe('wizard enhancers ', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('skipButtonsOnSteps', () => {
        ReactDOM.render(<WizardContainer><div id="step1"></div><div id="step2"></div><div id="step3"></div></WizardContainer>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.ms-wizard-next')).toExist();
        ReactDOM.render(<WizardContainer skipButtonsOnSteps={[0]} step={0}><div id="step1"></div><div id="step2"></div><div id="step3"></div></WizardContainer>, document.getElementById("container"));
        expect(container.querySelector('.ms-wizard-next')).toNotExist();
    });
    it('setPage callback calls onNextPage', () => {
        const actions = {
            setPage: () => {}
        };
        const spysetPage = expect.spyOn(actions, 'setPage');
        const container = document.getElementById('container');
        const cmp = ReactDOM.render((<WizardContainer setPage={actions.setPage}>
            <div id="step1"></div><div id="step2"></div><div id="step3"></div>
        </WizardContainer>), document.getElementById("container"));
        expect(cmp).toExist();
        ReactTestUtils.Simulate.click(container.querySelector('.ms-wizard-next')); // <-- trigger event callback
        expect(spysetPage).toHaveBeenCalled();
    });
    it('setPage callback calls onPrevPage', () => {
        const actions = {
            setPage: () => {}
        };
        const spysetPage = expect.spyOn(actions, 'setPage');
        const container = document.getElementById('container');
        const cmp = ReactDOM.render((<WizardContainer step={1} setPage={actions.setPage}>
            <div id="step1"></div><div id="step2"></div><div id="step3"></div>
        </WizardContainer>), document.getElementById("container"));
        expect(cmp).toExist();
        ReactTestUtils.Simulate.click(container.querySelector('.ms-wizard-prev')); // <-- trigger event callback
        expect(spysetPage).toHaveBeenCalled();
    });
});
