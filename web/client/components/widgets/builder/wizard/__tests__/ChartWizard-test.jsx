/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import ChartWizard, { isChartOptionsValid } from '../ChartWizard';
describe('ChartWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartWizard rendering with defaults', () => {
        ReactDOM.render(<ChartWizard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.chart-options-form')).toNotExist();
    });
    it('ChartWizard rendering chart options', () => {
        ReactDOM.render(<ChartWizard step={1}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.chart-options-form');
        expect(el).toExist();
    });
    describe('isChartOptionsValid', () => {
        it('mandatory operation if process present', () => {
            expect(isChartOptionsValid({
                aggregationAttribute: "A",
                groupByAttributes: "B"
            }, { hasAggregateProcess: true })).toBeFalsy();
            expect(isChartOptionsValid({
                aggregationAttribute: "A",
                groupByAttributes: "B",
                aggregateFunction: "SUM"
            }, { hasAggregateProcess: true })).toBeTruthy();
        });
        it('operation not needed if WPS not present', () => {
            expect(isChartOptionsValid({
                aggregationAttribute: "A",
                groupByAttributes: "B"
            }, { hasAggregateProcess: false })).toBeTruthy();
        });
    });
});
