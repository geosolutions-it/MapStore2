var expect = require('expect');
var React = require('react/addons');
var ReactDOM = require('react-dom');
var ConfirmDialog = require('../ConfirmDialog');

describe("ConfirmDialog component", () => {
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
        const cmp = ReactDOM.render(<ConfirmDialog/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates component with content', () => {
        const cmp = ReactDOM.render(<ConfirmDialog><div id="TEST">some content</div></ConfirmDialog>, document.getElementById("container"));
        expect(cmp).toExist();
        let background = document.getElementsByClassName("modal").item(0);
        expect(background).toExist();
        background.click();

    });

});
