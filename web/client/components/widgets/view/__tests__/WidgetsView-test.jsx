/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { Responsive } from 'react-grid-layout';

import WidgetsView from '../WidgetsView';

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
const customWidget = {
    id: "CUSTOM",
    title: "Custom Widget",
    type: "custom-widget",
    widgetType: "custom"
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
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toExist();
        const buttons = dialog.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
        ReactTestUtils.Simulate.click(buttons[1]); // <-- trigger event callback
        expect(spyDeleteWidget).toHaveBeenCalled();
    });
    it('renders custom widgets with the provided custom component', () => {
        const CustomComponent = ({ id, title }) => (
            <div className="custom-widget-body">
                <span id="custom-id">{id}</span>
                <span id="custom-title">{title}</span>
            </div>
        );
        ReactDOM.render(
            <WidgetsView
                widgets={[customWidget]}
                customWidgets={[{ type: 'custom-widget', Component: CustomComponent }]}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.custom-widget-body')).toExist();
        expect(container.querySelector('#custom-id').textContent).toBe('CUSTOM');
        expect(container.querySelector('#custom-title').textContent).toBe('Custom Widget');
        expect(container.querySelector('#widget-custom-CUSTOM')).toExist();
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
    it('derives a scoped locked layout while maximized without changing canonical props', () => {
        const widget = {
            ...dummyWidget,
            layoutId: 'view-1',
            dataGrid: {
                x: 2,
                y: 3,
                w: 2,
                h: 2,
                isDraggable: true,
                isResizable: true
            }
        };
        const layouts = {
            md: [{ i: widget.id, x: 2, y: 3, w: 2, h: 2 }],
            xxs: [{ i: widget.id, x: 0, y: 1, w: 1, h: 2 }]
        };
        const originalWidget = JSON.parse(JSON.stringify(widget));
        const originalLayouts = JSON.parse(JSON.stringify(layouts));
        const onLayoutChange = expect.createSpy();
        const render = maximized => ReactDOM.render(
            <WidgetsView
                width={600}
                useDefaultWidthProvider={false}
                widgets={[widget]}
                layouts={layouts}
                maximized={maximized}
                onLayoutChange={onLayoutChange}
            />,
            document.getElementById("container")
        );

        let component = render({
            widget: [widget, { id: 'other-view-widget', layoutId: 'view-2' }]
        });
        let grid = ReactTestUtils.findRenderedComponentWithType(component, Responsive);
        expect(grid.props.layouts.xxs.length).toBe(1);
        expect(grid.props.layouts.xxs[0]).toEqual({
            i: widget.id,
            x: 0,
            y: 0,
            w: 1,
            h: 1,
            isResizable: false,
            isDraggable: false
        });
        expect(grid.props.onLayoutChange).toNotBe(onLayoutChange);
        expect(widget).toEqual(originalWidget);
        expect(layouts).toEqual(originalLayouts);

        component = render({});
        grid = ReactTestUtils.findRenderedComponentWithType(component, Responsive);
        expect(grid.props.onLayoutChange).toBe(onLayoutChange);
        expect(grid.props.layouts.md[0].x).toBe(2);
        expect(grid.props.layouts.md[0].y).toBe(3);
    });
});
