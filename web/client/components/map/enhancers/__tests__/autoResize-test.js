/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink, lifecycle, compose} = require('recompose');
const expect = require('expect');
const autoResize = require('../autoResize');

describe('autoResize enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('autoResize rendering with defaults', (done) => {
        const Sink = autoResize()(createSink( props => {
            expect(props).toExist();
            expect(props.resize).toBe(0);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('check resize update', (done) => {
        const CMP = () => <div style={{width: "100%", height: "100%"}}></div>;
        const Sink = compose(
            autoResize(),
            lifecycle({
                componentDidUpdate() {
                    if (this.props.resize > 0) {
                        done();
                    }
                }
            })
        )(CMP);
        ReactDOM.render(<div style={{ position: 'relative', width: "20px", height: "20px" }}><Sink /></div>, document.getElementById("container"));
        ReactDOM.render(<div style={{ position: 'relative', width: "40px", height: "40px" }}><Sink /></div>, document.getElementById("container"));
        ReactDOM.render(<div style={{ position: 'relative', width: "60px", height: "60px" }}><Sink /></div>, document.getElementById("container"));
    });
});
