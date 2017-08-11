const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const PaginationButton = require('../PaginationButton');
const ReactTestUtils = require('react-dom/test-utils');

describe("test the PaginationButton", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test PaginationButton default props', () => {
        const paginationButton = ReactDOM.render(<PaginationButton/>, document.getElementById("container"));
        expect(paginationButton).toExist();
        const node = ReactDOM.findDOMNode(paginationButton);
        expect(node).toExist();
        ReactTestUtils.Simulate.click(node);
    });

    it('test PaginationButton vertical true', () => {
        const paginationButton = ReactDOM.render(<PaginationButton vertical/>, document.getElementById("container"));
        expect(paginationButton).toExist();
        const node = ReactDOM.findDOMNode(paginationButton);
        expect(node).toExist();
    });

    it('test PaginationButton direction false', () => {
        const paginationButton = ReactDOM.render(<PaginationButton direction={false}/>, document.getElementById("container"));
        expect(paginationButton).toExist();
        const node = ReactDOM.findDOMNode(paginationButton);
        expect(node).toExist();
    });

    it('test PaginationButton direction false and  vertical true', () => {
        const paginationButton = ReactDOM.render(<PaginationButton vertical direction={false}/>, document.getElementById("container"));
        expect(paginationButton).toExist();
        const node = ReactDOM.findDOMNode(paginationButton);
        expect(node).toExist();
    });
});
