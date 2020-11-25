/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {get} from 'lodash';
import expect from 'expect';
import CounterWizard, { isCounterOptionsValid } from '../CounterWizard';
import describeStates from '../../../../../test-resources/wfs/describe-states.json';


describe('CounterWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('CounterWizard rendering empty-view', () => {
        ReactDOM.render(<CounterWizard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.chart-options-form')).toNotExist();
        expect(container.querySelector('.empty-state-container')).toExist();

    });
    it('CounterWizard rendering with base attributes', () => {
        ReactDOM.render(<CounterWizard featureTypeProperties={get(describeStates, "featureTypes[0].properties")}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.chart-options-form')).toExist();
    });
    it('CounterWizard rendering widget options', () => {
        ReactDOM.render(<CounterWizard step={1}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.chart-options-form');
        expect(el).toNotExist();
    });
    describe('isChartOptionsValid', () => {
        it('mandatory operation and attribute if process present', () => {
            expect(isCounterOptionsValid({
                aggregationAttribute: "A"
            }, { hasAggregateProcess: true })).toBeFalsy();
            expect(isCounterOptionsValid({
                aggregateFunction: "SUM"
            }, { hasAggregateProcess: true })).toBeFalsy();
            expect(isCounterOptionsValid({
                aggregationAttribute: "A",
                aggregateFunction: "SUM"
            }, { hasAggregateProcess: true })).toBeTruthy();
        });
        it('invalid if aggregate process missing', () => {
            expect(isCounterOptionsValid({
                aggregationAttribute: "A",
                aggregateFunction: "SUM"
            }, { hasAggregateProcess: false })).toBeFalsy();
        });
    });
});
