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
const previewMap = require('../previewMap');

describe('previewMap enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('previewMap enhancer callbacks', (done) => {
        const actions = {
            callback: () => { }
        };
        const spyCallback = expect.spyOn(actions, 'callback');
        const Sink = previewMap(createSink( props => {
            props.onMapViewChanges({mapStateSource: "TEST"});
            expect(spyCallback).toHaveBeenCalled();
            expect(spyCallback.calls.length).toBe(2);
            expect(spyCallback.calls[0].arguments[0]).toBe("map");
            expect(spyCallback.calls[1].arguments[0]).toBe("mapStateSource");
            expect(spyCallback.calls[1].arguments[1]).toBe("TEST");
            done();

        }));
        ReactDOM.render(<Sink onChange={actions.callback}/>, document.getElementById("container"));
    });

});
