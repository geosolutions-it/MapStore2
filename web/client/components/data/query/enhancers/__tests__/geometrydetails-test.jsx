/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const geometrydetails = require('../geometrydetails');

describe('geometrydetails enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('geometrydetails onChangeDrawingStatus debounce', (done) => {
        const action = (status, method, owner, features) => {
            expect(status).toExist();
            expect(status).toBe("replace");
            expect(method).toNotExist();
            expect(owner).toExist();
            expect(owner).toBe("queryform");
            expect(features).toExist();
            expect(features).toBe("geom2");
            done();
        };
        const Sink = geometrydetails(createSink( props => {
            expect(props).toExist();
            expect(props.onChangeDrawingStatus).toExist();
            props.onChangeDrawingStatus("geom");
            props.onChangeDrawingStatus("geom1");
            props.onChangeDrawingStatus("replace", undefined, "queryform", "geom2");
        }));
        ReactDOM.render((<Sink onChangeDrawingStatus={action}
            />), document.getElementById("container"));
    });
});
