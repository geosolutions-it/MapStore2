import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import Home from '../Home';

describe("Test Home component", () => {
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
        const cmp = ReactDOM.render(<Home/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        expect(cmp.props.icon).toEqual("home");
        const icons = document.querySelectorAll(".glyphicon-home");
        expect(icons.length).toEqual(1);
        expect(icons[0]).toBeTruthy();
    });
    it('creates component with custom icon text', () => {
        const cmp = ReactDOM.render(
            <Home
                icon="pencil"
            />, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        expect(cmp.props.icon).toEqual("pencil");

        const buttons = document.querySelectorAll("button");
        expect(buttons.length).toEqual(1);
        expect(buttons[0]).toBeTruthy();

        const icons = document.querySelectorAll(".glyphicon-pencil");
        expect(icons.length).toEqual(1);
        expect(icons[0]).toBeTruthy();

    });
});
