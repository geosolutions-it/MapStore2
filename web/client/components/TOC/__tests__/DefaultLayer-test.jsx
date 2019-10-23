/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const dragDropContext = require('react-dnd').DragDropContext;
const testBackend = require('react-dnd-test-backend');
const Layer = dragDropContext(testBackend)(require('../DefaultLayer'));
// var ConfirmButton = require('../../buttons/ConfirmButton');
const expect = require('expect');
const TestUtils = require('react-dom/test-utils');

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
        const comp = ReactDOM.render(<Layer visibilityCheckType="checkbox" node={l} />, document.getElementById("container"));
        expect(comp).toExist();

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();
        expect(parseInt(checkbox.dataset.position, 10)).toBe(l.storeIndex);
        expect(checkbox.checked).toBe(l.visibility);

        const label = domNode.getElementsByClassName('toc-title').item(0);
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
        const comp = ReactDOM.render(<Layer visibilityCheckType="checkbox" node={l} />, document.getElementById("container"));
        expect(comp).toExist();

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();
        expect(parseInt(checkbox.dataset.position, 10)).toBe(l.storeIndex);
        expect(checkbox.checked).toBe(l.visibility);

        const label = domNode.getElementsByClassName('toc-title').item(0);
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
                visibilityCheckType="checkbox"
                propertiesChangeHandler={handler}
                node={l}
            />, document.getElementById("container"));
        expect(comp).toExist();

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();

        checkbox.checked = !l.visibility;
        TestUtils.Simulate.change(checkbox, {
            target: {
                checked: !l.visibility
            }
        });
        expect(newProperties.visibility).toBe(!l.visibility);
        expect(layer).toBe('layer00');
    });

    it('tests legend tool', () => {
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
        const comp = ReactDOM.render(<Layer visibilityCheckType="checkbox" node={l} activateLegendTool onToggle={actions.onToggle}/>,
            document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tool = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(comp, "toc-legend")[0]);
        expect(tool).toExist();
        tool.click();
        expect(spy.calls.length).toBe(1);
    });

    it('tests opacity tool', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms'
        };

        const comp = ReactDOM.render(<Layer visibilityCheckType="checkbox" node={l} activateLegendTool/>,
            document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tool = domNode.getElementsByClassName("noUi-target")[0];
        expect(tool).toExist();
        expect(tool.getAttribute('disabled')).toBe(null);
    });

    it('tests opacity tool no visibility', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5
        };

        const comp = ReactDOM.render(<Layer visibilityCheckType="checkbox" node={l} activateLegendTool/>,
            document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tool = domNode.getElementsByClassName("noUi-target")[0];
        expect(tool).toExist();
        expect(tool.getAttribute('disabled')).toBe('true');
    });

    it('tests disable legend and opacity tools', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5
        };

        const comp = ReactDOM.render(<Layer visibilityCheckType="checkbox" node={l} activateLegendTool={false} activateOpacityTool={false}/>,
            document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const collapsible = domNode.getElementsByClassName("collapsible-toc");
        expect(collapsible.length).toBe(0);
        const button = domNode.getElementsByClassName("toc-legend");
        expect(button.length).toBe(0);
    });

    it('tests disable opacity tools', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5
        };

        const comp = ReactDOM.render(<Layer visibilityCheckType="checkbox" node={l} activateLegendTool activateOpacityTool={false}/>,
            document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const collapsible = domNode.getElementsByClassName("collapsible-toc");
        expect(collapsible.length).toBe(1);
        const button = domNode.getElementsByClassName("toc-legend");
        expect(button.length).toBe(1);
        const slider = domNode.getElementsByClassName("mapstore-slider");
        expect(slider.length).toBe(0);
    });
    it('show full title enabled', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5,
            expanded: true
        };

        const comp = ReactDOM.render(<Layer showFullTitleOnExpand node={l} />,
            document.getElementById("container"));
        expect(comp).toExist();
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const title = domNode.getElementsByClassName("toc-full-title");
        expect(title.length).toBe(1);
    });
    it('show full title disabled', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5,
            expanded: true
        };

        const comp = ReactDOM.render(<Layer showFullTitleOnExpand={false} node={l} />,
            document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const title = domNode.getElementsByClassName("toc-full-title");
        expect(title.length).toBe(0);

    });
    it('support for indicators', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5,
            expanded: true,
            dimensions: [{
                name: "time"
            }]
        };
        const indicators = [{
            "type": "dimension",
            "key": "calendar",
            "glyph": "calendar",
            "props": {
                className: "TIME_INDICATOR"
            },
            "condition": {
                "name": "time"
            }
        }];
        const comp = ReactDOM.render(<Layer indicators={indicators} node={l} />,
            document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const title = domNode.getElementsByClassName("TIME_INDICATOR");
        expect(title.length).toBe(1);
    });

    it('test wmts', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9,
            type: 'wmts',
            opacity: 0.5
        };
        const comp = ReactDOM.render(<Layer showFullTitleOnExpand={false} node={l} />,
            document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const title = domNode.getElementsByClassName("chevron-left");
        expect(title.length).toBe(0);
    });

    it('show tooltip', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5
        };
        const comp = ReactDOM.render(<Layer node={l}/>,
            document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tooltips = domNode.getElementsByClassName('noUi-tooltip');
        expect(tooltips.length).toBe(1);
        expect(tooltips[0].innerHTML).toBe('50 %');
    });

    it('hide tooltip', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5
        };
        const comp = ReactDOM.render(<Layer hideOpacityTooltip node={l}/>,
            document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const tooltips = domNode.getElementsByClassName('noUi-tooltip');
        expect(tooltips.length).toBe(0);
    });

    it('showComponent false hides item', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5,
            showComponent: false
        };
        const comp = ReactDOM.render(<Layer hideOpacityTooltip node={l} />,
            document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toNotExist();
    });

    it('showComponent true shows item', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            opacity: 0.5,
            showComponent: true
        };
        const comp = ReactDOM.render(<Layer hideOpacityTooltip node={l} />,
            document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
    });

    it('test dummy node', () => {
        const node = {
            id: 'Group1__dummy',
            dummy: true
        };

        const comp = ReactDOM.render(<Layer node={node}/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(domNode.style).toExist();
        expect(domNode.style.opacity).toBe('0');
        expect(domNode.style.boxShadow).toBe('none');
        const headNode = domNode.getElementsByClassName('toc-default-layer-head')[0];
        expect(headNode).toExist();
        expect(headNode.childNodes.length).toBe(0);
    });
});
