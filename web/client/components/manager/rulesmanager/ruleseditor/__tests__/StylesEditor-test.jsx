/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const StylesEditor = require('../StylesEditor.jsx');
const constraints = {
    allowedStyles: {style: ["poly_landmarks"]},
    defaultStyle: "poly_landmarks"
};
const ReactTestUtils = require('react-dom/test-utils');
const styles = [{name: "poly_landmarks", title: "poly_landmarks"}];
describe('Styles Editor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render nothing if not  active', () => {
        ReactDOM.render(<StylesEditor/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-rule-editor');
        expect(el).toExist();
        expect(el.style.display).toBe("none");
    });
    it('render defaults when active', () => {
        ReactDOM.render(<StylesEditor active/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const rows = container.querySelectorAll('.ms-add-style');
        expect(rows).toExist();
        expect(rows.length).toBe(2);
        const btns = container.querySelectorAll('button');
        expect(btns).toExist();
        expect(btns.length).toBe(2);
        ReactTestUtils.Simulate.click(btns[0]);
        ReactTestUtils.Simulate.click(btns[1]);

    });
    it('render defaults style and styles list', () => {
        ReactDOM.render(<StylesEditor active styles={styles} constraints={constraints} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const cards = container.querySelectorAll('.mapstore-side-card');
        expect(cards).toExist();
        expect(cards.length).toBe(2);
    });
    it('render default style modal', () => {
        ReactDOM.render(<StylesEditor active modal="default" styles={styles} constraints={constraints} />, document.getElementById("container"));
        const modal = document.querySelector('.ms-style-modal');
        expect(modal).toExist();
        const sideCard = modal.querySelector(".mapstore-side-card");
        expect(sideCard).toExist();
        ReactTestUtils.Simulate.click(sideCard);
    });
    it('render availables styles modal', () => {
        ReactDOM.render(<StylesEditor active modal="availables" styles={styles} constraints={constraints} />, document.getElementById("container"));
        const modal = document.querySelector('.ms-style-modal');
        expect(modal).toExist();
        const sideCard = modal.querySelector(".mapstore-side-card");
        expect(sideCard).toExist();
        ReactTestUtils.Simulate.click(sideCard);
        const btns = modal.querySelectorAll('button');
        expect(btns).toExist();
        expect(btns.length).toBe(2);
        ReactTestUtils.Simulate.click(btns[0]);
        ReactTestUtils.Simulate.click(btns[1]);
    });

});
