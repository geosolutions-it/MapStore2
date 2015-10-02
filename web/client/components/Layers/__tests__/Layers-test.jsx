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
var Group = require('../../Group/Group');
var Layer = require('../../Layer/Layer');

describe('Layers component', () => {
    const testData = [{
        group: 'G0',
        name: 'L1',
        visibility: false
    }, {
        group: 'G0',
        name: 'L2',
        visibility: true
    }, {
        group: 'G1',
        name: 'L3',
        visibility: true
    }, {
        group: 'G1',
        name: 'L4',
        visibility: false
    }, {
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
    }];

    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHtml = '';
        setTimeout(done);
    });

    it('test Layers component that use group as own direct children', () => {
        var grpSet = new Set();
        testData.forEach((layer) => {
            grpSet.add(layer.group);
        });

        const element = React.render(
            <Layers layers={testData} useGroups={true}>
                <Group>
                    <Layer/>
                </Group>
            </Layers>,
        document.body);
        expect(element).toExist();

        const domNode = React.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(grpSet.size);
    });

    it('test filter function', () => {
        var filter = (layer) => {
            return layer.group !== 'G2';
        };
        var grpSet = new Set();
        testData.forEach((layer) => {
            if (filter(layer)) {
                grpSet.add(layer.group);
            }
        });

        const element = React.render(
            <Layers filter={filter} layers={testData} useGroups={true}>
                <Group>
                    <Layer/>
                </Group>
            </Layers>,
        document.body);
        expect(element).toExist();

        const domNode = React.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(grpSet.size);
    });

    it('test Layers component that use layers as own direct children', () => {

        var element = React.render(
            <Layers layers={testData}>
                    <Layer/>
            </Layers>,
        document.body);
        expect(element).toExist();

        const domNode = React.findDOMNode(element);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(testData.length);
    });
});
