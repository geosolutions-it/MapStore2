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
    it('renders the html fragment in the shadow root of the host', () => {
        ReactDOM.render(<ShadowHtml id="info" html="<p>value</p>" />, document.getElementById('container'));
        const host = document.getElementById('info');
        expect(host.childNodes.length).toBe(0);
        expect(host.shadowRoot.innerHTML).toBe('<p>value</p>');
        expect(host.style.color).toBe('rgb(0, 0, 0)');
    });
    it('positions a fixed banner relative to the host box', () => {
        ReactDOM.render(<ShadowHtml id="info" html={'<p>before</p><div id="banner" style="position: fixed; top: 0; left: 0; width: 50px; height: 10px;"></div>'} />, document.getElementById('container'));
        const host = document.getElementById('info');
        const hostRect = host.getBoundingClientRect();
        const bannerRect = host.shadowRoot.getElementById('banner').getBoundingClientRect();
        expect(bannerRect.top).toBe(hostRect.top);
        expect(bannerRect.left).toBe(hostRect.left);
    });
    it('positions an absolute badge relative to the host box', () => {
        ReactDOM.render(<ShadowHtml id="info" html={'<p>value</p><div id="badge" style="position: absolute; top: 4px; right: 4px; width: 40px; height: 10px;"></div>'} />, document.getElementById('container'));
        const host = document.getElementById('info');
        const hostRect = host.getBoundingClientRect();
        const badgeRect = host.shadowRoot.getElementById('badge').getBoundingClientRect();
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
