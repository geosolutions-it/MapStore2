/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink, compose} = require('recompose');
const expect = require('expect');
const debounce = require('../debounce');

describe('debounce enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('debounce call only last action', (done) => {
        const action = (status, method, owner, features) => {
            expect(status).toBeTruthy();
            expect(status).toBe("replace");
            expect(method).toBeFalsy();
            expect(owner).toBeTruthy();
            expect(owner).toBe("queryform");
            expect(features).toBeTruthy();
            expect(features).toBe("geom2");
            done();
        };
        const Sink = compose(debounce("onChangeDrawingStatus", 800))(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.onChangeDrawingStatus).toBeTruthy();
            props.onChangeDrawingStatus("geom");
            props.onChangeDrawingStatus("geom1");
            props.onChangeDrawingStatus("replace", undefined, "queryform", "geom2");
        }));
        ReactDOM.render((<Sink onChangeDrawingStatus={action}
        />), document.getElementById("container"));
    });
});
