const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const PreviewList = require('../PreviewList');
const ReactTestUtils = require('react-dom/test-utils');

describe("test the PreviewList", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test PreviewList default props', () => {
        const previewList = ReactDOM.render(<PreviewList/>, document.getElementById("container"));
        expect(previewList).toExist();
        const node = ReactDOM.findDOMNode(previewList);
        expect(node).toExist();
    });

    it('test PreviewList pagination is true', () => {
        const previewList = ReactDOM.render(<PreviewList pagination/>, document.getElementById("container"));
        expect(previewList).toExist();
        const node = ReactDOM.findDOMNode(previewList);
        expect(node).toExist();
    });

    it('test PreviewList pagination is true and start is different from 0', () => {
        const previewList = ReactDOM.render(<PreviewList vertical pagination start={1} length={6}/>, document.getElementById("container"));
        expect(previewList).toExist();
        const node = ReactDOM.findDOMNode(previewList);
        expect(node).toExist();
        const pagination = node.children[0];
        ReactTestUtils.Simulate.click(pagination);
    });

});
