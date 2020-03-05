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
const handleNodePropertyChanges = require('../handleNodePropertyChanges');

describe('handleNodePropertyChanges enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handleNodePropertyChanges rendering with defaults', (done) => {
        const Sink = handleNodePropertyChanges(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.changeGroupProperty).toBeTruthy();
            expect(props.changeLayerProperty).toBeTruthy();
            expect(props.changeLayerPropertyByGroup).toBeTruthy();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('Test handleNodePropertyChange onChange calls', () => {
        const actions = {
            onChange: () => {}
        };
        const spyCallbacks = expect.spyOn(actions, 'onChange');
        const Sink = handleNodePropertyChanges(createSink(props => {
            expect(props).toBeTruthy();
            props.changeGroupProperty("GGG", "title", "TEST");
            props.changeLayerProperty("LAYER", "name", "TEST");
            props.changeLayerPropertyByGroup("GGG", "title", "TEST");
            props.updateMapEntries({
                a: "a",
                b: "b"
            });

        }));
        ReactDOM.render(<Sink
            map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", group: "GGG", options: {} }] }}
            onChange={actions.onChange} />, document.getElementById("container"));
        expect(spyCallbacks.mock.calls.length).toBe(5);
        expect(spyCallbacks.mock.calls[0][0]).toBe("map.groups[0].title");
        expect(spyCallbacks.mock.calls[0][1]).toBe("TEST");
        expect(spyCallbacks.mock.calls[1][0]).toBe("map.layers[0].name");
        expect(spyCallbacks.mock.calls[1][1]).toBe("TEST");
        expect(spyCallbacks.mock.calls[2][0]).toBe("map.layers[0].title");
        expect(spyCallbacks.mock.calls[2][1]).toBe("TEST");
        expect(spyCallbacks.mock.calls[3][0]).toBe("map[a]");
        expect(spyCallbacks.mock.calls[3][1]).toBe("a");
        expect(spyCallbacks.mock.calls[4][0]).toBe("map[b]");
        expect(spyCallbacks.mock.calls[4][1]).toBe("b");
    });
});
