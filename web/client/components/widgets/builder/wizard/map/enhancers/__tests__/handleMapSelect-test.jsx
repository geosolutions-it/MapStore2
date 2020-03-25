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
import handleMapSelect from "../handleMapSelect";

describe('handleMapSelect enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handleMapSelect enhancer callbacks', (done) => {
        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.onMapChoice).toExist();
            expect(props.map.id).toExist();
            expect(['number', 'string'].includes(typeof props.map.id)).toBe(true);
            done();
        });
        const EnhancedSink = handleMapSelect(sink);
        ReactDOM.render(<EnhancedSink map={{id: '001'}} />, document.getElementById("container"));
    });
});
