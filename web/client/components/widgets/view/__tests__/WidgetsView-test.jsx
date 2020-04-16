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
const { Responsive } = require('react-grid-layout');
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
    it('Test WidgetsView with width=460', () => {
        const WIDGET_MOBILE_RIGHT_SPACE = 34;
        const width = 460;
        const cmp = ReactDOM.render(<WidgetsView widgets={[dummyWidget]} useDefaultWidthProvider={false} width={width}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const innerLayout = ReactTestUtils.findRenderedComponentWithType(cmp, Responsive);
        expect(innerLayout).toExist();
        expect(innerLayout.props.width).toEqual(width - WIDGET_MOBILE_RIGHT_SPACE);
    });
    it('Test WidgetsView with width=640', () => {
        const width = 640;
        const cmp = ReactDOM.render(<WidgetsView widgets={[dummyWidget]} useDefaultWidthProvider={false} width={width}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const innerLayout = ReactTestUtils.findRenderedComponentWithType(cmp, Responsive);
        expect(innerLayout).toExist();
        expect(innerLayout.props.width).toEqual(width);
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
    it('Test widget with and without resource in mobile', () => {
        const actions = {
            editWidget: () => {}
        };
        const isMobile = [true, false];
        [{canEdit: true}, null].map((resource, id)=>{
            const props = {
                canEdit: isMobile[id] ? !isMobile[id] : resource && !!resource.canEdit
            };
            const cmp = ReactDOM.render(<WidgetsView widgets={[dummyWidget]} editWidget={actions.editWidget} {...props} />, document.getElementById("container"));
            expect(cmp).toExist();
            const container = document.getElementById('container');
            expect(container.querySelector('.glyphicon-pencil')).toNotExist();
        });
    });
    it('Test widget with resource in desktop', () => {
        const actions = {
            editWidget: () => {}
        };
        const resource = {
            canEdit: true
        };
        const isMobile = false;
        const props = {
            canEdit: isMobile ? !isMobile : resource && !!resource.canEdit
        };
        const spyEditWidget = expect.spyOn(actions, 'editWidget');
        const cmp = ReactDOM.render(<WidgetsView widgets={[dummyWidget]} editWidget={actions.editWidget} {...props} />, document.getElementById("container"));
        expect(cmp).toExist();
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toExist();
        ReactTestUtils.Simulate.click(container.querySelector('.glyphicon-pencil'));
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
