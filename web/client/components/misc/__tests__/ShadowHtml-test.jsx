/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import ShadowHtml from '../ShadowHtml';

// the fragment is rendered in a shadow root nested in the one of the host
const getFragment = host => host.shadowRoot.firstElementChild;
const getFragmentRoot = host => getFragment(host).shadowRoot;

describe('ShadowHtml component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container" style="width: 200px; margin: 40px;"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('renders the html fragment in a shadow root nested in the one of the host', () => {
        ReactDOM.render(<ShadowHtml id="info" html="<p>value</p>" />, document.getElementById('container'));
        const host = document.getElementById('info');
        expect(host.childNodes.length).toBe(0);
        expect(host.shadowRoot.innerHTML).toBe('<div></div>');
        expect(getFragmentRoot(host).innerHTML).toBe('<p>value</p>');
        expect(host.style.color).toBe('rgb(0, 0, 0)');
    });
    it('replaces the html fragment in the same shadow roots when the html changes', () => {
        ReactDOM.render(<ShadowHtml id="info" html="<p>first</p>" />, document.getElementById('container'));
        const host = document.getElementById('info');
        const fragment = getFragment(host);
        ReactDOM.render(<ShadowHtml id="info" html="<p>second</p>" />, document.getElementById('container'));
        expect(host.shadowRoot.childNodes.length).toBe(1);
        expect(getFragment(host)).toBe(fragment);
        expect(getFragmentRoot(host).innerHTML).toBe('<p>second</p>');
    });
    it('gives the text color of the host to the html fragment', () => {
        ReactDOM.render(<ShadowHtml id="info" html={'<p id="text">value</p>'} style={{ color: '#333333' }} />, document.getElementById('container'));
        const host = document.getElementById('info');
        expect(getComputedStyle(getFragmentRoot(host).getElementById('text')).color).toBe('rgb(51, 51, 51)');
    });
    it('applies the host rules of the html fragment to the box of the fragment', () => {
        const html = '<style>:host { display: block; position: relative; width: 120px; } @scope { :scope { height: 30px; } }</style><p style="margin: 0;">value</p>';
        ReactDOM.render(<ShadowHtml id="info" html={html} />, document.getElementById('container'));
        const host = document.getElementById('info');
        const fragmentRect = getFragment(host).getBoundingClientRect();
        expect(getComputedStyle(getFragment(host)).position).toBe('relative');
        expect(fragmentRect.width).toBe(120);
        expect(fragmentRect.height).toBe(30);
        expect(getComputedStyle(host).position).toBe('static');
        expect(getComputedStyle(host).contain).toBe('paint');
        expect(host.getBoundingClientRect().width).toBe(200);
        expect(host.getBoundingClientRect().height).toBe(30);
    });
    it('keeps the layout of the host when the html fragment sets it as important', () => {
        const html = '<style>:host { contain: none !important; overflow: visible !important; }</style><p>value</p>';
        ReactDOM.render(<ShadowHtml id="info" html={html} />, document.getElementById('container'));
        const host = document.getElementById('info');
        expect(getComputedStyle(getFragment(host)).contain).toBe('none');
        expect(getComputedStyle(host).contain).toBe('paint');
        expect(getComputedStyle(host).overflow).toBe('auto');
    });
    it('positions a fragment with a fixed box relative to the host box', () => {
        const html = '<style>:host { position: fixed; top: 0; left: 0; width: 50px; height: 10px; }</style><p>value</p>';
        ReactDOM.render(<ShadowHtml id="info" html={html} />, document.getElementById('container'));
        const host = document.getElementById('info');
        const hostRect = host.getBoundingClientRect();
        const fragmentRect = getFragment(host).getBoundingClientRect();
        expect(fragmentRect.top).toBe(hostRect.top);
        expect(fragmentRect.left).toBe(hostRect.left);
        expect(hostRect.width).toBe(200);
        expect(getComputedStyle(host).position).toBe('static');
    });
    it('positions a fixed banner relative to the host box', () => {
        ReactDOM.render(<ShadowHtml id="info" html={'<p>before</p><div id="banner" style="position: fixed; top: 0; left: 0; width: 50px; height: 10px;"></div>'} />, document.getElementById('container'));
        const host = document.getElementById('info');
        const hostRect = host.getBoundingClientRect();
        const bannerRect = getFragmentRoot(host).getElementById('banner').getBoundingClientRect();
        expect(bannerRect.top).toBe(hostRect.top);
        expect(bannerRect.left).toBe(hostRect.left);
    });
    it('positions an absolute badge relative to the host box', () => {
        ReactDOM.render(<ShadowHtml id="info" html={'<p>value</p><div id="badge" style="position: absolute; top: 4px; right: 4px; width: 40px; height: 10px;"></div>'} />, document.getElementById('container'));
        const host = document.getElementById('info');
        const hostRect = host.getBoundingClientRect();
        const badgeRect = getFragmentRoot(host).getElementById('badge').getBoundingClientRect();
        expect(badgeRect.top).toBe(hostRect.top + 4);
        expect(badgeRect.right).toBe(hostRect.right - 4);
    });
    it('scrolls a table wider than the host inside the host', () => {
        ReactDOM.render(<ShadowHtml id="info" html={'<table style="width: 500px;"><tr><td>value</td></tr></table>'} />, document.getElementById('container'));
        const host = document.getElementById('info');
        expect(host.getBoundingClientRect().width).toBe(200);
        expect(host.scrollWidth).toBe(500);
        host.scrollLeft = 100;
        expect(host.scrollLeft).toBe(100);
    });
    it('keeps the containment when a custom style is given', () => {
        ReactDOM.render(<ShadowHtml id="info" html="<p>value</p>" style={{ color: '#333333', overflow: 'visible' }} />, document.getElementById('container'));
        const host = document.getElementById('info');
        expect(host.style.color).toBe('rgb(51, 51, 51)');
        expect(host.style.contain).toBe('paint');
        expect(host.style.overflow).toBe('auto');
    });
});
