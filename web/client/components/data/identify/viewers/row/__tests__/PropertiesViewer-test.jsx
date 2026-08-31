/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import PropertiesViewer from '../PropertiesViewer';

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
        ReactDOM.render(<PropertiesViewer/>, document.getElementById("container"));
        const viewerNode = document.querySelector('.ms-properties-viewer');
        expect(viewerNode).toBeTruthy();
    });
    it('test title rendering', () => {
        ReactDOM.render(<PropertiesViewer feature={{ id: "testTitle" }}/>, document.getElementById("container"));
        const titleNode = document.querySelector('.ms-properties-viewer-title');
        expect(titleNode).toBeTruthy();
        expect(titleNode.innerHTML).toBe("testTitle");
    });
    it('test body rendering', () => {
        const testProps = {
            k0: "v0",
            k1: "v1",
            k2: "v2"
        };
        const cmp = ReactDOM.render(<PropertiesViewer feature={{ properties: testProps }}/>, document.getElementById("container"));
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
            const rowData = child.querySelectorAll('div');
            const key = rowData[0].innerHTML;
            const value = rowData[1].innerHTML;
            return prev
                && key === testKey && value === testVal;
        }, true)).toBe(true);
    });

    it('test rendering an html property', () => {
        const testProps = {
            withHtml: "<p id=\"rendered-html\">some text</p>"
        };
        ReactDOM.render(<PropertiesViewer feature={{ properties: testProps }}/>, document.getElementById("container"));
        const viewerBodyNode = document.querySelector('.ms-properties-viewer-body');
        const renderedPNode = viewerBodyNode.querySelector('#rendered-html');
        expect(renderedPNode).toBeTruthy();
        expect(renderedPNode.innerHTML).toBe('some text');
    });
    it('test rendering properties with fields aliases', () => {
        const testProps = {
            k0: "v0",
            k1: "v1",
            k2: "v2"
        };
        const fields = [{
            name: "k0",
            alias: "alias0"
        }, {
            name: "k1",
            alias: "alias1"
        }, {
            name: "k2",
            alias: {
                "default": "localeAlias2"
            }
        }];

        const cmp = ReactDOM.render(<PropertiesViewer
            feature={{ properties: testProps }}
            fields={fields}

        />, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toBeTruthy();

        expect(cmpDom.childNodes.length).toBe(1);

        const body = cmpDom.childNodes.item(0);
        expect(body.childNodes.length).toBe(Object.keys(testProps).length);

        const testKeys = Object.keys(testProps);
        body.childNodes.forEach((child, i) => {
            let testKey = testKeys[i];
            let testVal = testProps[testKey];
            const rowData = child.querySelectorAll('div');
            const key = rowData[0].innerHTML;
            const value = rowData[1].innerHTML;
            expect(key).toBe(fields[i].alias?.default || fields[i].alias);
            expect(value).toBe(testVal);
        });
    });

    it('test rendering properties ordered by fields and filtered by feature properties presence', () => {
        const testProps = {
            k0: "v0",
            k1: "v1",
            k2: "v2"
        };
        const fields = [
            { name: "k2", alias: "alias2" },
            { name: "nonExistingKey", alias: "nonExisting" },
            { name: "k0", alias: "alias0" }
        ];

        const cmp = ReactDOM.render(<PropertiesViewer
            feature={{ properties: testProps }}
            fields={fields}
        />, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toBeTruthy();

        const body = cmpDom.childNodes.item(0);
        expect(body.childNodes.length).toBe(2);
        const row0 = body.childNodes[0].querySelectorAll('div');
        expect(row0[0].innerHTML).toBe("alias2");
        expect(row0[1].innerHTML).toBe("v2");
        const row1 = body.childNodes[1].querySelectorAll('div');
        expect(row1[0].innerHTML).toBe("alias0");
        expect(row1[1].innerHTML).toBe("v0");
    });

    describe('sanitization', () => {
        it('removes script tags from a property value', () => {
            window.__propertiesViewerScript = undefined;
            const feature = { id: 'f1', properties: { info: '<p>content</p><script>window.__propertiesViewerScript = true</script>' } };
            ReactDOM.render(<PropertiesViewer feature={feature} />, document.getElementById("container"));
            expect(window.__propertiesViewerScript).toBe(undefined);
            expect(document.getElementById("container").innerHTML.indexOf('<script')).toBe(-1);
        });
        it('keeps the formatting tags of a property value', () => {
            const feature = { id: 'f1', properties: { info: '<p><b>bold</b></p>' } };
            ReactDOM.render(<PropertiesViewer feature={feature} />, document.getElementById("container"));
            expect(document.querySelector('.ms-properties-viewer-value b')).toBeTruthy();
        });
    });
});
