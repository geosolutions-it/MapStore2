/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const sampleChartData = require('../sampleChartData');

describe('sampleChartData enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('sampleChartData rendering with defaults', (done) => {
        const Sink = sampleChartData(createSink( props => {
            expect(props).toExist();
            expect(props.data).toExist();
            expect(props.series).toExist();
            expect(props.xAxis).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
});
