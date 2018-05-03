var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var ConfirmModal = require('../ConfirmModal');

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
        ReactDOM.render(<ConfirmModal />, document.getElementById("container"));

    });

    it('creates component with content', () => {
        ReactDOM.render(<ConfirmModal show options={{ className: "modal-dialog" }}><div id="TEST">some content</div></ConfirmModal>, document.getElementById("container"));

        let background = document.getElementsByClassName("modal-fixed").item(0);
        let dialog = document.getElementsByClassName("modal-dialog").item(0);
        expect(background).toExist();
        expect(dialog).toExist();
        expect(document.querySelectorAll('button').length).toBe(2); // close, confirm, cancel
    });

});
