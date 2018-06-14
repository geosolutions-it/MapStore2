/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const decimalToAeronautical = require('../decimalToAeronautical');
const {createSink} = require('recompose');

// const TestUtils = require('react-dom/test-utils');

describe("test the Annotations enahncers", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('decimalToAeronautical conversion', (done) => {
        const Sink = decimalToAeronautical(createSink( props => {
            expect(props).toExist();
            expect(props.degrees).toBe(1);
            expect(props.minutes).toBe(30);
            expect(props.seconds).toBe(0);
        }));
        ReactDOM.render((<Sink
            value = {1.5}
            coordinate="lon"
            />), document.getElementById("container"));

        const Sink2 = decimalToAeronautical(createSink( props => {
            expect(props).toExist();
            expect(props.degrees).toBe(1);
            expect(props.minutes).toBe(33);
            expect(props.seconds).toBe(0);
            done();
        }));
        ReactDOM.render((<Sink2
            value = {1.55}
            />), document.getElementById("container"));
    });
});
