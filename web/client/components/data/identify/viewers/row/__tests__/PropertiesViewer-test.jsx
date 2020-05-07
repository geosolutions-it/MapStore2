/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var PropertiesViewer = require('../PropertiesViewer');

describe('PropertiesViewer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test defaults', () => {
        const cmp = ReactDOM.render(<PropertiesViewer/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(0);
    });
    it('test title rendering', () => {
        ReactDOM.render(<PropertiesViewer title="testTitle"/>, document.getElementById("container"));
        const titleNode = document.querySelector('.ms-properties-viewer-title');
        expect(titleNode).toBeTruthy();
        expect(titleNode.querySelector('th').innerHTML).toBe("testTitle");
    });
    it('test body rendering', () => {
        const testProps = {
            k0: "v0",
            k1: "v1",
            k2: "v2"
        };
        const cmp = ReactDOM.render(<PropertiesViewer {...testProps}/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toBeTruthy();

        expect(cmpDom.childNodes.length).toBe(1);

        const body = cmpDom.childNodes.item(0);
        expect(body.childNodes.length).toBe(Object.keys(testProps).length);

        const testKeys = Object.keys(testProps);
        expect(Array.prototype.reduce.call(body.childNodes, (prev, child, i) => {
            let testKey = testKeys[i];
            let testVal = testProps[testKey];
            const rowData = child.querySelectorAll('td');
            const key = rowData[0].innerHTML;
            const value = rowData[1].innerHTML;
            return prev
                && key === testKey && value === testVal;
        }, true)).toBe(true);
    });

    it('test feature isexcluded', () => {
        const cmp = ReactDOM.render(<PropertiesViewer feature={"myfeature"} title="testTitle" />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.innerText.indexOf('myfeature')).toBe(-1);
    });


    it('test rendering an html property', () => {
        const testProps = {
            withHtml: "<div> some text </div>"
        };
        const cmp = ReactDOM.render(<PropertiesViewer {...testProps}/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toBeTruthy();
        expect(cmpDom.children.length).toBe(1);

        const body = cmpDom.children[0];

        const tdChildren = body.querySelectorAll('td');
        const spanChild = tdChildren[1].querySelector('span');
        expect(spanChild).toBeTruthy();
        expect(spanChild.innerHTML).toBe(testProps.withHtml);
    });
});
