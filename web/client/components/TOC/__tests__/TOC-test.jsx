/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');
const dragDropContext = require('react-dnd').DragDropContext;
const testBackend = require('react-dnd-test-backend');

const TOC = dragDropContext(testBackend)(require('../TOC'));
const Group = require('../DefaultGroup');
const Layer = require('../DefaultLayer');

const testData = [
    {
        name: "G0",
        title: "G0",
        showComponent: true,
        nodes: [
            {
                group: 'G0',
                name: 'L1',
                visibility: false
            }, {
                group: 'G0',
                name: 'L2',
                visibility: true
            }
        ]
    },
    {
        name: "G1",
        title: "G1",
        showComponent: true,
        nodes: [
            {
                group: 'G1',
                name: 'L3',
                visibility: true
            }, {
                group: 'G1',
                name: 'L4',
                visibility: false
            }
        ]
    },
    {
        name: "G2",
        title: "G2",
        showComponent: true,
        nodes: [
            {
                group: 'G2',
                name: 'L5',
                visibility: true
            }, {
                group: 'G2',
                name: 'L6',
                visibility: false
            }, {
                group: 'G2',
                name: 'L7',
                visibility: true
            }
        ]
    }
];

const layers = [
    {
        group: 'G2',
        name: 'L5',
        visibility: true
    }, {
        group: 'G2',
        name: 'L6',
        visibility: false
    }, {
        group: 'G2',
        name: 'L7',
        visibility: true
    }
];

describe('Layers component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHtml = '';
        setTimeout(done);
    });

    it('test Layers component that use group as own direct children', () => {

        const element = ReactDOM.render(
            <TOC nodes={testData}>
                <Group>
                    <Layer/>
                </Group>
            </TOC>,
            document.getElementById("container"));
        expect(element).toExist();

        const domNode = ReactDOM.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(3);
    });

    it('test filter function', () => {
        var filter = (layer) => {
            return layer.name !== 'G2';
        };

        const element = ReactDOM.render(
            <TOC filter={filter} nodes={testData}>
                <Group>
                    <Layer/>
                </Group>
            </TOC>,
            document.getElementById("container"));
        expect(element).toExist();

        const domNode = ReactDOM.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(2);
    });

    it('test Layers component that use layers as own direct children', () => {

        var element = ReactDOM.render(
            <TOC nodes={layers}>
                <Layer/>
            </TOC>,
            document.getElementById("container"));
        expect(element).toExist();

        const domNode = ReactDOM.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(layers.length);
    });

    it('test node sortIndex assignment', () => {
        const nodes = [{
            id: 'layer00',
            name: 'layer00',
            visibility: true,
            type: 'wms',
            url: 'fakeurl'
        }, {
            id: 'Group1',
            name: 'Group1',
            nodes: []
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
            id: 'Group2',
            name: 'Group2',
            nodes: []
        }];

        class TestComponent extends React.Component {
            render() {
                return <div></div>;
            }
        }

        const comp = ReactDOM.render(<TOC nodes={nodes}><TestComponent/></TOC>, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const elements = TestUtils.scryRenderedComponentsWithType(comp, TestComponent);
        expect(elements.length).toBe(7);

        const sortIndexes = {
            "layer00": 0,
            "Group1": 1,
            "Group1__dummy": 2,
            "layer01": 2,
            "layer02": 3,
            "Group2": 3,
            "Group2__dummy": 4
        };

        elements.forEach(el => expect(el.props.sortIndex).toBe(sortIndexes[el.props.node.id]));
    });
});
