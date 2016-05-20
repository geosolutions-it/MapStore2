/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react/addons');
var ReactDOM = require('react-dom');
var Layer = require('../DefaultLayer');

var expect = require('expect');

describe('test DefaultLayer module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests DefaultLayer component creation (wms)', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms'
        };
        const comp = ReactDOM.render(<Layer node={l} />, document.getElementById("container"));
        expect(comp).toExist();

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();
        expect(parseInt(checkbox.dataset.position, 10)).toBe(l.storeIndex);
        expect(checkbox.checked).toBe(l.visibility);

        const label = domNode.getElementsByTagName('span').item(0);
        expect(label).toExist();
        expect(label.innerHTML).toBe(l.title || l.name);
    });

    it('tests DefaultLayer component creation (no wms)', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9
        };
        const comp = ReactDOM.render(<Layer node={l} />, document.getElementById("container"));
        expect(comp).toExist();

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();
        expect(parseInt(checkbox.dataset.position, 10)).toBe(l.storeIndex);
        expect(checkbox.checked).toBe(l.visibility);

        const label = domNode.getElementsByTagName('span').item(0);
        expect(label).toExist();
        expect(label.innerHTML).toBe(l.title || l.name);
    });

    it('test change event', () => {
        let newProperties;
        let layer;

        let handler = (l, p) => {
            layer = l;
            newProperties = p;
        };

        const l = {
            name: 'layer00',
            id: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9
        };
        const comp = ReactDOM.render(
            <Layer
                propertiesChangeHandler={handler}
                node={l}
            />, document.getElementById("container"));
        expect(comp).toExist();

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();

        checkbox.checked = !l.visibility;
        React.addons.TestUtils.Simulate.change(checkbox, {
            target: {
                checked: !l.visibility
            }
        });
        expect(newProperties.visibility).toBe(!l.visibility);
        expect(layer).toBe('layer00');
    });

    it('tests legend tool', () => {
        const TestUtils = React.addons.TestUtils;
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms'
        };
        const actions = {
            onToggle: () => {}
        };
        let spy = expect.spyOn(actions, "onToggle");
        const comp = ReactDOM.render(<Layer node={l} activateLegendTool={true} onToggle={actions.onToggle}/>,
            document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tool = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "glyphicon")[0]);
        expect(tool).toExist();
        tool.click();
        expect(spy.calls.length).toBe(1);
    });

    it('tests settings tool', () => {
        const TestUtils = React.addons.TestUtils;
        const l = {
            id: 'layerId1',
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5
        };
        const actions = {
            onSettings: () => {}
        };
        let spy = expect.spyOn(actions, "onSettings");
        const comp = ReactDOM.render(<Layer node={l} activateSettingsTool={true} onSettings={actions.onSettings}/>,
            document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tool = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "glyphicon")[0]);
        expect(tool).toExist();
        tool.click();
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments.length).toBe(3);
        expect(spy.calls[0].arguments[0]).toBe("layerId1");
        expect(spy.calls[0].arguments[1]).toBe("layers");
        expect(spy.calls[0].arguments[2]).toEqual({opacity: 0.5});
    });

});
