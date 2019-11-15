import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import WebPage from '../WebPage';
// import ReactTestUtils from 'react-dom/test-utils';

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
            height={100}
            width={100}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toExist();
    });

    it('should render page when provided all neccesary data', () => {
        ReactDOM.render(<WebPage
            src="http://www.google.com"
            height={100}
            width={100}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toExist();
    });

    it('should\'t render page when src is not provided', () => {
        ReactDOM.render(<WebPage
            height={100}
            width={100}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toBe(null);
        expect(container.querySelector(".empty-state-main-view")).toExist();
    });

    it('should\'t render page when width is not provided', () => {
        ReactDOM.render(<WebPage
            src="http://www.google.com"
            height={100}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector(".ms-webpage-wrapper")).toBe(null);
        expect(container.querySelector(".empty-state-main-view")).toExist();
    });

    it('should\'t render page when height is not provided', () => {
        ReactDOM.render(<WebPage
            src="http://www.google.com"
            width={100}
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
