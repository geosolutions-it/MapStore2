const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const PreviewButton = require('../PreviewButton');
const ReactTestUtils = require('react-dom/test-utils');

describe("test the PreviewButton", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test PreviewButton default props', () => {
        const previewButton = ReactDOM.render(<PreviewButton/>, document.getElementById("container"));
        expect(previewButton).toExist();
        const node = ReactDOM.findDOMNode(previewButton);
        expect(node).toExist();
        const container = node.querySelector('.background-preview-button-container');
        ReactTestUtils.Simulate.click(container);
    });

    it('test PreviewButton show label', () => {
        const previewButton = ReactDOM.render(<PreviewButton showLabel={false}/>, document.getElementById("container"));
        expect(previewButton).toExist();
        const node = ReactDOM.findDOMNode(previewButton);
        expect(node).toExist();
    });
});
