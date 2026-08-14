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
import HtmlRenderer from '../HtmlRenderer';

describe("This test for HtmlRenderer component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates componet with defaults', () => {
        const cmp = ReactDOM.render(<HtmlRenderer/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const node = ReactDOM.findDOMNode(cmp);
        expect(node.id).toBeFalsy();
        expect(node.childNodes.length).toBe(0);
    });

    it('creates empty componet with id', () => {
        const cmp = ReactDOM.render(<HtmlRenderer id="testId"/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const node = ReactDOM.findDOMNode(cmp);
        expect(node.id).toBe("testId");
        expect(node.childNodes.length).toBe(0);
    });

    it('creates a filled componet', () => {
        const srcCode = '<p id="innerP"><span id="innerSPAN">text</span></p>';
        const cmp = ReactDOM.render(<HtmlRenderer html={srcCode}/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const node = ReactDOM.findDOMNode(cmp);
        expect(node.childNodes.length).toBe(1);

        const innerP = node.childNodes[0];
        expect(innerP.id).toBe("innerP");
        expect(innerP.childNodes.length).toBe(1);

        const innerSPAN = innerP.childNodes[0];
        expect(innerSPAN.id).toBe("innerSPAN");
        expect(innerSPAN.innerHTML).toBe("text");
    });
    it('should change the style of the component', () => {
        const cmp = ReactDOM.render(<HtmlRenderer style={{ color: 'rgb(255, 255, 255)' }}/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const node = ReactDOM.findDOMNode(cmp);
        expect(node.id).toBeFalsy();
        expect(node.style.color).toBe('rgb(255, 255, 255)');
    });

    // ── Security regression: DOMPurify.sanitize on html prop (SM-16 / X-11) ──
    it('sanitizes <script> tags injected via html prop', () => {
        window.__xss_htmlrenderer = undefined;
        const evilHtml = '<p>hello</p><script>window.__xss_htmlrenderer=true</script>';
        ReactDOM.render(<HtmlRenderer html={evilHtml}/>, document.getElementById("container"));
        expect(window.__xss_htmlrenderer).toBe(undefined);
        expect(document.getElementById("container").innerHTML.indexOf('<script')).toBe(-1);
    });

    it('sanitizes inline event handlers like onerror', () => {
        window.__xss_onerror = undefined;
        const evilHtml = '<img src="x" onerror="window.__xss_onerror=true">';
        ReactDOM.render(<HtmlRenderer html={evilHtml}/>, document.getElementById("container"));
        // give onerror a chance to fire if not stripped
        expect(window.__xss_onerror).toBe(undefined);
        const node = ReactDOM.findDOMNode(document.getElementById("container").firstChild);
        expect(node.innerHTML.toLowerCase().indexOf('onerror')).toBe(-1);
    });

    it('preserves legitimate formatting HTML', () => {
        const safeHtml = '<p><b>bold</b> and <i>italic</i></p>';
        ReactDOM.render(<HtmlRenderer html={safeHtml}/>, document.getElementById("container"));
        const inner = document.getElementById("container").innerHTML;
        expect(inner.indexOf('<b>bold</b>')).toBeGreaterThan(-1);
        expect(inner.indexOf('<i>italic</i>')).toBeGreaterThan(-1);
    });

    it('handles null/undefined html without throwing', () => {
        expect(() => ReactDOM.render(<HtmlRenderer html={null}/>, document.getElementById("container"))).toNotThrow();
        expect(() => ReactDOM.render(<HtmlRenderer html={undefined}/>, document.getElementById("container"))).toNotThrow();
    });
});
