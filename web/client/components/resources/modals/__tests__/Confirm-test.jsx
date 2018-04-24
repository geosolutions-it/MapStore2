var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var ConfirmDialog = require('../Confirm');

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

    it('creates component with defaults', () => {
        const cmp = ReactDOM.render(<ConfirmDialog />, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates component with content', () => {
        const cmp = ReactDOM.render(<ConfirmDialog show options={{className: "modal-dialog"}}><div id="TEST">some content</div></ConfirmDialog>, document.getElementById("container"));
        expect(cmp).toExist();

        let background = document.getElementsByClassName("modal").item(0);
        let dialog = document.getElementsByClassName("modal-dialog").item(0);
        expect(background).toExist();
        expect(dialog).toExist();
        expect(document.querySelectorAll('button').length).toBe(3); // close, confirm, cancel
    });

});
