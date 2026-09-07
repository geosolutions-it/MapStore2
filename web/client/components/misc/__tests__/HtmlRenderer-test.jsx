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
        ReactDOM.render(<HtmlRenderer/>, document.getElementById("container"));
        const node = document.getElementById("container").firstChild;
        expect(node).toBeTruthy();
        expect(node.id).toBeFalsy();
        expect(node.childNodes.length).toBe(0);
    });

    it('creates empty componet with id', () => {
        ReactDOM.render(<HtmlRenderer id="testId"/>, document.getElementById("container"));
        const node = document.getElementById("container").firstChild;
        expect(node).toBeTruthy();
        expect(node.id).toBe("testId");
        expect(node.childNodes.length).toBe(0);
    });

    it('creates a filled componet', () => {
        const srcCode = '<p id="innerP"><span id="innerSPAN">text</span></p>';
        ReactDOM.render(<HtmlRenderer html={srcCode}/>, document.getElementById("container"));
        const node = document.getElementById("container").firstChild;
        expect(node).toBeTruthy();
        expect(node.childNodes.length).toBe(1);

        const innerP = node.childNodes[0];
        expect(innerP.id).toBe("innerP");
        expect(innerP.childNodes.length).toBe(1);

        const innerSPAN = innerP.childNodes[0];
        expect(innerSPAN.id).toBe("innerSPAN");
        expect(innerSPAN.innerHTML).toBe("text");
    });
    it('should change the style of the component', () => {
        ReactDOM.render(<HtmlRenderer style={{ color: 'rgb(255, 255, 255)' }}/>, document.getElementById("container"));
        const node = document.getElementById("container").firstChild;
        expect(node).toBeTruthy();
        expect(node.id).toBeFalsy();
        expect(node.style.color).toBe('rgb(255, 255, 255)');
    });

    describe('sanitization', () => {
        it('removes script tags from the html prop', () => {
            window.__htmlRendererScript = undefined;
            ReactDOM.render(<HtmlRenderer html={'<p>content</p><script>window.__htmlRendererScript = true</script>'} />, document.getElementById("container"));
            expect(window.__htmlRendererScript).toBe(undefined);
            expect(document.getElementById("container").innerHTML.indexOf('<script')).toBe(-1);
        });
        it('removes inline event handlers from the html prop', () => {
            window.__htmlRendererHandler = undefined;
            ReactDOM.render(<HtmlRenderer html={'<img src="missing-image" onerror="window.__htmlRendererHandler = true">'} />, document.getElementById("container"));
            expect(window.__htmlRendererHandler).toBe(undefined);
            expect(document.getElementById("container").innerHTML.toLowerCase().indexOf('onerror')).toBe(-1);
        });
        it('keeps the formatting tags of the html prop', () => {
            ReactDOM.render(<HtmlRenderer html={'<p><b>bold</b> and <i>italic</i></p>'} />, document.getElementById("container"));
            const inner = document.getElementById("container").innerHTML;
            expect(inner.indexOf('<b>bold</b>')).toBeGreaterThan(-1);
            expect(inner.indexOf('<i>italic</i>')).toBeGreaterThan(-1);
        });
        it('renders an empty html prop without throwing', () => {
            expect(() => ReactDOM.render(<HtmlRenderer html={null} />, document.getElementById("container"))).toNotThrow();
            expect(() => ReactDOM.render(<HtmlRenderer html={undefined} />, document.getElementById("container"))).toNotThrow();
        });
    });
});
