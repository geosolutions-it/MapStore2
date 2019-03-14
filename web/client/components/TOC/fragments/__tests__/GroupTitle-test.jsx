/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const GroupTitle = require('../GroupTitle');

const expect = require('expect');
const ReactTestUtils = require('react-dom/test-utils');
const {getTooltip} = require('../../../../utils/TOCUtils');

describe('test GroupTitle module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests GroupTitle attribute title as object without currentLocale', () => {
        const l = {
            title: {
                'default': 'Group',
                'it-IT': 'Gruppo'
            }
        };
        const comp = ReactDOM.render(<GroupTitle node={l} currentLocale="en-US"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const title = domNode.getElementsByClassName('toc-group-title').item(0);
        expect(title).toExist();
        expect(title.innerHTML).toBe(l.title.default);
    });

    it('tests GroupTitle attribute title as object with currentLocale', () => {
        const l = {
            title: {
                'default': 'Group',
                'it-IT': 'Gruppo'
            }
        };
        const comp = ReactDOM.render(<GroupTitle node={l} currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const title = domNode.getElementsByClassName('toc-group-title').item(0);
        expect(title).toExist();
        expect(title.innerHTML).toBe(l.title['it-IT']);
    });

    it('tests GroupTitle without title', () => {
        const comp = ReactDOM.render(<GroupTitle node={{}} currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const title = domNode.getElementsByClassName('toc-group-title').item(0);
        expect(title).toExist();
        expect(title.innerHTML).toBe('');
    });

    it('tests GroupTitle with tooltip', () => {
        const l = {
            name: "1.3",
            title: {
                'default': 'Group',
                'it-IT': 'Gruppo'
            }
        };
        const comp = ReactDOM.render(<GroupTitle node={l} tooltip currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        ReactTestUtils.Simulate.mouseOver(domNode);
        expect(ReactDOM.findDOMNode(comp).getAttribute('aria-describedby')).toBe('tooltip-layer-group');
    });

    it('tests GroupTitle without tooltip', () => {
        const l = {
            title: {
                'default': 'Group',
                'it-IT': 'Gruppo'
            }
        };
        const comp = ReactDOM.render(<GroupTitle node={l} currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        ReactTestUtils.Simulate.mouseOver(domNode);
        expect(ReactDOM.findDOMNode(comp).getAttribute('aria-describedby')).toBe(null);
    });

    it('tests GroupTitle with customtooltip fragments', () => {
        const node = {
            name: 'group1',
            title: {
                'default': 'Group',
                'it-IT': 'Gruppo'
            },
            id: "group1",
            description: "desc",
            tooltipOptions: "both"
        };
        const currentLocale = "it-IT";
        const comp = ReactDOM.render(<GroupTitle node={node} tooltip currentLocale={currentLocale}/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        ReactTestUtils.Simulate.mouseOver(domNode);
        expect(ReactDOM.findDOMNode(comp).getAttribute('aria-describedby')).toBe('tooltip-layer-group');
        expect(getTooltip(node, currentLocale)).toBe("Gruppo - desc");
    });
});
