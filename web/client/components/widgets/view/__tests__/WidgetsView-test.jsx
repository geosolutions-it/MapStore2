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
const WidgetsView = require('../WidgetsView');
const ReactTestUtils = require('react-dom/test-utils');
const dummyWidget = {
    title: "TEST",
    id: "TEST",
    layer: {
        name: "test",
        url: 'base/web/client/test-resources/widgetbuilder/aggregate',
        wpsUrl: 'base/web/client/test-resources/widgetbuilder/aggregate',
        search: { url: 'base/web/client/test-resources/widgetbuilder/aggregate' }
    },
    options: {
        aggregateFunction: "Count",
        aggregationAttribute: "test",
        groupByAttributes: "test"
    }
};
describe('WidgetsView component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('WidgetsView rendering with defaults', () => {
        ReactDOM.render(<WidgetsView />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-container');
        expect(el).toExist();
    });
    it('Test WidgetsView with widgets', () => {
        ReactDOM.render(<WidgetsView widgets={[dummyWidget]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-card');
        expect(el).toExist();
    });
    it('handler editWidget', () => {
        const actions = {
            editWidget: () => {}
        };
        const spyEditWidget = expect.spyOn(actions, 'editWidget');
        const cmp = ReactDOM.render(<WidgetsView widgets={[dummyWidget]} editWidget={actions.editWidget} />, document.getElementById("container"));
        expect(cmp).toExist();
        const container = document.getElementById('container');
        ReactTestUtils.Simulate.click(container.querySelector('.glyphicon-pencil')); // <-- trigger event callback
        expect(spyEditWidget).toHaveBeenCalled();
    });
    it('handler deleteWidget', () => {
        const actions = {
            deleteWidget: () => { }
        };
        const spyDeleteWidget = expect.spyOn(actions, 'deleteWidget');
        const cmp = ReactDOM.render(<WidgetsView widgets={[dummyWidget]} deleteWidget={actions.deleteWidget} />, document.getElementById("container"));
        expect(cmp).toExist();
        const container = document.getElementById('container');
        ReactTestUtils.Simulate.click(container.querySelector('.glyphicon-trash')); // <-- trigger event callback
        expect(spyDeleteWidget).toNotHaveBeenCalled(); // callback should have been called only after confirm dialog
        expect(document.querySelector('.modal-dialog')).toExist(); // confirm dialog opened. NOTE: rendered in the document, not in the container
        ReactTestUtils.Simulate.click(document.querySelector('.modal-footer button'));
        expect(spyDeleteWidget).toHaveBeenCalled();
    });
    it('layouts', () => {
        ReactDOM.render(<WidgetsView layouts={{ md: [{ i: dummyWidget.id, w: 1, h: 1, x: 1, y: 1 }]}} widgets={[dummyWidget]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.react-grid-item');
        expect(el).toExist();
    });
    it('statics widgets', () => {
        ReactDOM.render(<WidgetsView layouts={{ md: [{ i: dummyWidget.id, w: 1, h: 1, x: 1, y: 1 }] }} widgets={[{...dummyWidget, dataGrid: {"static": true, w: 1, h: 1, x: 1, y: 1 }}]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.react-grid-item.static');
        expect(el).toExist();
    });
});
