import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import Home from '../Home';

const mockStore = configureMockStore();

describe("Test Home component", () => {
    let store;
    beforeEach((done) => {
        store = mockStore();
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const cmp = ReactDOM.render(<Provider store={store}><Home/></Provider>, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        const icons = document.querySelectorAll(".glyphicon-home");
        expect(icons.length).toEqual(1);
        expect(icons[0]).toBeTruthy();
    });
    it('creates component with custom icon text', () => {
        const cmp = ReactDOM.render(
            <Provider store={store}><Home
                icon="pencil"
            /></Provider>, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        const buttons = document.querySelectorAll("button");
        expect(buttons.length).toEqual(1);
        expect(buttons[0]).toBeTruthy();

        const icons = document.querySelectorAll(".glyphicon-pencil");
        expect(icons.length).toEqual(1);
        expect(icons[0]).toBeTruthy();

    });
});
