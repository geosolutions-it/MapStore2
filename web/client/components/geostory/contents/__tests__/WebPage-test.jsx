/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import WebPage from '../WebPage';

describe('WebPage component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render page when provided all neccesary data', () => {
        ReactDOM.render(<WebPage
            src="http://www.google.com"
            size="large"
            viewHeight={100}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toExist();
    });

    it('should render page when provided all neccesary data', () => {
        ReactDOM.render(<WebPage
            src="http://www.google.com"
            size="large"
            viewHeight={100}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toExist();
    });

    it('should\'t render page when src is not provided', () => {
        ReactDOM.render(<WebPage
            size="large"
            viewHeight={100}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toBe(null);
        expect(container.querySelector(".empty-state-main-view")).toExist();
    });

    it('should\'t render page when size is not provided', () => {
        ReactDOM.render(<WebPage
            src="http://www.google.com"
            viewHeight={100}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toBe(null);
        expect(container.querySelector(".empty-state-main-view")).toExist();
    });

    it('should\'t render page when viewHeight is not provided', () => {
        ReactDOM.render(<WebPage
            src="http://www.google.com"
            size="large"
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toBe(null);
        expect(container.querySelector(".empty-state-main-view")).toExist();
    });

    it('should render proper placeholder when data is empty', () => {
        ReactDOM.render(<WebPage />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toBe(null);
        expect(container.querySelector(".glyphicon-code")).toExist();
    });
});
