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
const WidgetsBar = require('../WidgetsBar');
const ReactTestUtils = require('react-dom/test-utils');

describe('WidgetsBar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('WidgetsBar rendering with defaults', () => {
        ReactDOM.render(<WidgetsBar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widgets-bar');
        expect(el).toExist();
    });
    it('WidgetsBar rendering widgets', () => {
        ReactDOM.render(<WidgetsBar widgets={[{type: "unknown"}]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group button');
        expect(el).toExist();
    });
    it('WidgetsBar rendering icons', () => {
        // charts
        ReactDOM.render(<WidgetsBar widgets={[{ widgetType: "chart" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-stats')).toExist();
        ReactDOM.render(<WidgetsBar widgets={[{ type: "pie" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-pie-chart')).toExist();
        ReactDOM.render(<WidgetsBar widgets={[{ type: "line" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-1-line')).toExist();
        ReactDOM.render(<WidgetsBar widgets={[{ type: "bar" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-stats')).toExist();
        ReactDOM.render(<WidgetsBar widgets={[{ type: "counter" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-counter')).toExist();

        // other widgets
        ReactDOM.render(<WidgetsBar widgets={[{ widgetType: "text" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-sheet')).toExist();
        ReactDOM.render(<WidgetsBar widgets={[{ widgetType: "table" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-features-grid')).toExist();
        ReactDOM.render(<WidgetsBar widgets={[{ widgetType: "counter" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-counter')).toExist();
        ReactDOM.render(<WidgetsBar widgets={[{ widgetType: "map" }]} />, document.getElementById("container"));
        expect(document.getElementById('container').querySelector('.glyphicon-1-map')).toExist();
    });
    it('Test WidgetsBar onClick', () => {
        const actions = {
            onClick: () => {}
        };
        const spyonClick = expect.spyOn(actions, 'onClick');
        ReactDOM.render(<WidgetsBar widgets={[{ widgetType: "text" }]} onClick={actions.onClick} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group button');
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonClick).toHaveBeenCalled();
    });

});
