/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const { createSink } = require('recompose');
const expect = require('expect');
const CMP = () => <div><div id="mydiv" style={{ height: "100px", overflow: "auto" }}><div style={{height: "1000px"}}></div></div></div>;
const withScrollSpy = require('../withScrollSpy');

describe('withScrollSpy enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', (done) => {
        const Sink = withScrollSpy({ querySelector: "div" })(createSink( () => {
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));

    });
    it('Test withScrollSpy onLoadMore callback', done => {
        const actions = {
            onLoadMore: () => {
                done();
            }
        };
        const EnhancedCMP = withScrollSpy({ querySelector: "#mydiv" })(CMP);
        const cmp = ReactDOM.render(<EnhancedCMP onLoadMore={actions.onLoadMore} items={[1]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        // simulate scroll event
        const element = document.getElementById('mydiv');
        element.scrollTop = element.scrollHeight - element.clientHeight;
    });
    it('Test withScrollSpy onLoadMore callback with items', done => {
        const actions = {
            onLoadMore: (v) => {
                // this should be the items.length / pageSize, if dataProp is defined
                expect(v).toBe(2);
                done();
            }
        };
        const EnhancedCMP = withScrollSpy({ querySelector: "#mydiv" })(CMP);
        const cmp = ReactDOM.render(<EnhancedCMP onLoadMore={actions.onLoadMore} items={Array(20)} />, document.getElementById("container"));
        expect(cmp).toExist();
        // simulate scroll event
        const element = document.getElementById('mydiv');
        element.scrollTop = element.scrollHeight - element.clientHeight;
    });
});
