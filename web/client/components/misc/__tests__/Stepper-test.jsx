/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import * as TestUtils from 'react-dom/test-utils';
import Stepper from '../Stepper';

describe('Stepper component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Stepper rendering with defaults', () => {
        const steps = [{
            id: 'test',
            label: 'test',
            component: <div className="test-component"></div>
        }];

        ReactDOM.render(<Stepper steps={steps} currentStepId="test"/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const stepper = container.getElementsByClassName('ms2-stepper')[0];
        expect(stepper).toExist();
        const footerStepBar = container.getElementsByClassName('footer-step-bar')[0];
        expect(footerStepBar).toExist();
        expect(footerStepBar.childElementCount).toBe(1);
    });

    it('Stepper clickable on edit', (done) => {
        const container = document.getElementById("container");
        const enableClickOnStep = true;
        const steps = [{
            id: 'test',
            label: 'test',
            component: <div className="test-component"></div>
        },
        {
            id: 'test2',
            label: 'test2',
            component: <div className="test-component"></div>
        }
        ];
        let currentStep = steps[0];
        const onSetStep = (stepId) => {
            for (let i = 0; i < steps.length; i++) {
                if (steps[i].id === stepId) {
                    currentStep = steps[i];
                }
            }
            expect(currentStep.id).toBe('test2');
            done();
        };
        ReactDOM.render(<Stepper steps={steps} currentStepId={currentStep.id} enableClickOnStep={enableClickOnStep} onSetStep={onSetStep} />, container);
        const footerStepBar = container.getElementsByClassName('footer-step-bar')[0];

        const stepButton = footerStepBar.children[2];

        TestUtils.Simulate.click(stepButton);
    });
});


