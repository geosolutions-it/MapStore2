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
const {widthProvider, heightProvider} = require('../gridLayout');

describe('gridLayout enhancers', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('widthProvider rendering with defaults', (done) => {
        const Sink = widthProvider()(createSink( props => {
            expect(props).toExist();
            expect(props.useDefaultWidthProvider).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('widthProvider rendering override defaults', (done) => {
        const Sink = widthProvider({overrideWidthProvider: true})(createSink(props => {
            expect(props).toExist();
            expect(props.useDefaultWidthProvider).toBe(false);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('heightProvider rendering with defaults', (done) => {
        const Sink = heightProvider()(createSink(props => {
            expect(props).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
});
