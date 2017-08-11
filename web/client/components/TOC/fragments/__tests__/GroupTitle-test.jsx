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

const getInnerHTML = (title) => {
    return '<span class="glyphicon glyphicon-folder-open" style="margin-right: 8px;"></span><!-- react-text: 3 -->' + title + '<!-- /react-text -->';
};

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
        expect(domNode.innerHTML).toBe(getInnerHTML(l.title.default));
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
        expect(domNode.innerHTML).toBe(getInnerHTML(l.title['it-IT']));
    });

    it('tests GroupTitle without title', () => {
        const comp = ReactDOM.render(<GroupTitle node={{}} currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(domNode.innerHTML).toBe('<span class="glyphicon glyphicon-folder-open" style="margin-right: 8px;"></span>');
    });
});
