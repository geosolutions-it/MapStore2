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
const nodeEditor = require('../nodeEditor');

describe('nodeEditor enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('nodeEditor rendering with map', (done) => {
        const Sink = nodeEditor(createSink( props => {
            expect(props).toExist();
            expect(props.groups.length).toBe(1);
            expect(props.nodes).toExist();
            expect(props.element).toExist();
            expect(props.activeTab).toBe("general");
            expect(props.settings.nodeType).toBe('layers');
            done();
        }));
        ReactDOM.render(<Sink
            editNode={"LAYER"}
            map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", group: "GGG", options: {} }] }}/>, document.getElementById("container"));
    });
    it('nodeEditor rendering callback', () => {
        const Sink = nodeEditor(createSink( props => {
            expect(props.onChange).toExist();
            props.onChange("a", "b");

        }));
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<Sink
            onChange={actions.onChange}
            editNode={"LAYER"}
            map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", group: "GGG", options: {} }] }}/>, document.getElementById("container"));
        expect(spyonChange).toHaveBeenCalled();
    });
    it('nodeEditor onUpdateParams callback', () => {
        const Sink = nodeEditor(createSink(props => {
            expect(props.onUpdateParams).toExist();
            props.onUpdateParams({something: "newValue"}, true);

        }));
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<Sink
            settings={{nodeType: "layer", props: {oldKey: "oldValue"}}}
            onChange={actions.onChange}
            editNode={"LAYER"}
            map={{ groups: [{ id: 'GROUP' }], layers: [{ id: "LAYER", group: "GROUP", options: {} }] }} />, document.getElementById("container"));
        expect(spyonChange).toHaveBeenCalledWith("map.layers[0].something", "newValue");
    });

});
