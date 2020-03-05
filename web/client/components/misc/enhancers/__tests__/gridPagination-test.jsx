/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const gridPagination = require('../gridPagination');
const loadPage = () => {};
const pageSize = 4;
const CMP = gridPagination({loadPage, pageSize})(({className, bottom}) =>
    <div id="CMP" className={className}>
        <div className="grid"></div>
        {bottom && <div className="bottom">{bottom}</div>}
    </div>
);

describe('gridPagination enhancher', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('gridPagination rendering with default', () => {
        ReactDOM.render(<CMP />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#CMP');
        expect(el).toBeTruthy();
        const bottom = el.querySelector('.bottom');
        expect(bottom).toBeFalsy();
    });
    it('gridPagination rendering with show more', () => {
        ReactDOM.render(<CMP pagination="show-more"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#CMP');
        expect(el).toBeTruthy();
        const bottom = el.querySelector('.bottom');
        expect(bottom).toBeTruthy();
        const showMore = el.querySelector('.ms-show-more');
        expect(showMore).toBeTruthy();
    });
    it('gridPagination rendering with horizontal virtual scroll', () => {
        ReactDOM.render(<CMP pagination="virtual-scroll-horizontal"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#CMP');
        expect(el).toBeTruthy();
        const bottom = el.querySelector('.bottom');
        expect(bottom).toBeTruthy();

        expect(el.getAttribute('class')).toBe(' ms-grid-horizontal');
    });
});
