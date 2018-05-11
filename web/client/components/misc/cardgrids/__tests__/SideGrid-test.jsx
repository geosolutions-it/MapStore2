/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const SideGrid = require('../SideGrid');
describe('SideGrid component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SideGrid rendering with defaults', () => {
        ReactDOM.render(<SideGrid />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
        expect(el.querySelector(".items-list")).toExist();
    });
    it('SideGrid rendering with className', () => {
        ReactDOM.render(<SideGrid className="TEST_CLASS"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.TEST_CLASS');
        expect(el).toExist();
        expect(el.querySelector(".items-list")).toExist();
    });
    it('Test SideGrid onItemClick', () => {
        const actions = {
            onItemClick: () => {}
        };
        const spyonItemClick = expect.spyOn(actions, 'onItemClick');
        ReactDOM.render(<SideGrid onItemClick={actions.onItemClick} items={[{}]}/>, document.getElementById("container"));
        const el = document.querySelector('.mapstore-side-card');
        expect(el).toExist();
        el.click();
        expect(spyonItemClick).toHaveBeenCalled();
    });
    it('Test SideGrid custom cards', () => {
        const CustomCardComponent = ({title}) => <div className="custom-card-component">{title}</div>;

        ReactDOM.render(<SideGrid
            cardComponent={CustomCardComponent}
            items={[{id: 'card-01', title: 'Card title 01'}, {id: 'card-02', title: 'Card title 02'}]}/>, document.getElementById("container"));

        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();

        let customCards = container.getElementsByClassName('custom-card-component');
        expect(customCards.length).toBe(2);
        expect(customCards[0].innerHTML).toBe('Card title 01');
        expect(customCards[1].innerHTML).toBe('Card title 02');

        ReactDOM.render(<SideGrid
            items={[{id: 'card-01', title: 'Card title 01'}, {id: 'card-02', title: 'Card title 02'}]}/>, document.getElementById("container"));

        customCards = container.getElementsByClassName('custom-card-component');
        expect(customCards.length).toBe(0);

    });
});
