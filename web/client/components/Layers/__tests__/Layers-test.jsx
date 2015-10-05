/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');

var Layers = require('../Layers');
var Group = require('../Group');
var Layer = require('../Layer');

let testData = [
    {
        name: "G0",
        title: "G0",
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

let layers = [
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
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHtml = '';
        setTimeout(done);
    });

    it('test Layers component that use group as own direct children', () => {

        const element = React.render(
            <Layers nodes={testData}>
                <Group>
                    <Layer/>
                </Group>
            </Layers>,
        document.body);
        expect(element).toExist();

        const domNode = React.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(3);
    });

    it('test filter function', () => {
        var filter = (layer) => {
            return layer.name !== 'G2';
        };

        const element = React.render(
            <Layers filter={filter} nodes={testData}>
                <Group>
                    <Layer/>
                </Group>
            </Layers>,
        document.body);
        expect(element).toExist();

        const domNode = React.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(2);
    });

    it('test Layers component that use layers as own direct children', () => {

        var element = React.render(
            <Layers nodes={layers}>
                <Layer/>
            </Layers>,
        document.body);
        expect(element).toExist();

        const domNode = React.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(layers.length);
    });
});
