/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');
const GroupChildren = require('../GroupChildren');

const expect = require('expect');

describe('test GroupChildren module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests GroupChildren component creation', () => {
        const l1 = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };

        const g = {
            name: "g1",
            title: "G1",
            nodes: [l1]
        };
        const comp = ReactDOM.render(<GroupChildren node={g}><div className="layer" /></GroupChildren>, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const layers = domNode.getElementsByClassName('layer');
        expect(layers).toExist();
        expect(layers.length).toBe(1);
    });

    it('tests GroupChildren sortIndex assignment', () => {
        const node = {
            id: 'Group',
            name: 'Group',
            nodes: [{
                id: 'layer00',
                name: 'layer00',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }, {
                id: 'Group.Group1',
                name: 'Group1',
                nodes: []
            }, {
                id: 'Group.Group1__dummy',
                dummy: true
            }, {
                id: 'layer01',
                name: 'layer01',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }, {
                id: 'layer02',
                hide: true
            }, {
                id: 'Group.Group2',
                name: 'Group2',
                nodes: []
            }, {
                id: 'Group.Group2__dummy',
                dummy: true
            }]
        };

        class TestComponent extends React.Component {
            render() {
                return <div></div>;
            }
        }

        const comp = ReactDOM.render(<GroupChildren node={node}><TestComponent/></GroupChildren>, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const elements = TestUtils.scryRenderedComponentsWithType(comp, TestComponent);
        expect(elements.length).toBe(7);

        const sortIndexes = {
            "layer00": 0,
            "Group.Group1": 1,
            "Group.Group1__dummy": 2,
            "layer01": 2,
            "layer02": 3,
            "Group.Group2": 3,
            "Group.Group2__dummy": 4
        };

        elements.forEach(el => expect(el.props.sortIndex).toBe(sortIndexes[el.props.node.id]));
    });
});
