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
            expect(props).toExist();
            expect(props.changeGroupProperty).toExist();
            expect(props.changeLayerProperty).toExist();
            expect(props.changeLayerPropertyByGroup).toExist();
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
            expect(props).toExist();
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
        expect(spyCallbacks.calls.length).toBe(5);
        expect(spyCallbacks.calls[0].arguments[0]).toBe("map.groups[0].title");
        expect(spyCallbacks.calls[0].arguments[1]).toBe("TEST");
        expect(spyCallbacks.calls[1].arguments[0]).toBe("map.layers[0].name");
        expect(spyCallbacks.calls[1].arguments[1]).toBe("TEST");
        expect(spyCallbacks.calls[2].arguments[0]).toBe("map.layers[0].title");
        expect(spyCallbacks.calls[2].arguments[1]).toBe("TEST");
        expect(spyCallbacks.calls[3].arguments[0]).toBe("map[a]");
        expect(spyCallbacks.calls[3].arguments[1]).toBe("a");
        expect(spyCallbacks.calls[4].arguments[0]).toBe("map[b]");
        expect(spyCallbacks.calls[4].arguments[1]).toBe("b");
    });
});
