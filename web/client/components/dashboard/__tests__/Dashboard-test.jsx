/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Responsive } from 'react-grid-layout';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import Dashboard from '../Dashboard';

const testWidget = {
    title: "TEST",
    id: "TEST",
    layer: {
        name: "test",
        url: 'base/web/client/test-resources/widgetbuilder/aggregate',
        wpsUrl: 'base/web/client/test-resources/widgetbuilder/aggregate',
        search: {url: 'base/web/client/test-resources/widgetbuilder/aggregate'}},
    options: {
        aggregateFunction: "Count",
        aggregationAttribute: "test",
        groupByAttributes: "test"
    }
};

/* eslint-disable react/prop-types */
class TestDashboardContainer extends React.Component {
    render() {
        const {style, ...props} = this.props;
        return (
            <div style={style}>
                <Dashboard {...props}/>
            </div>
        );
    }
}
/* eslint-enable react/prop-types */

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
    it('DashBoard empty', () => {
        ReactDOM.render(<Dashboard widgets={[]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-card-on-map');
        expect(el).toNotExist();
    });
    it('DashBoard empty', () => {
        ReactDOM.render(<Dashboard widgets={[testWidget]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-card');
        expect(el).toExist();
    });
    it('DashBoard with width=460', () => {
        const WIDGET_MOBILE_RIGHT_SPACE = 34;
        const width = 460;
        const cmp = ReactDOM.render(<TestDashboardContainer style={{width, height: 480}} widgets={[testWidget]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const innerLayout = ReactTestUtils.findRenderedComponentWithType(cmp, Responsive);
        expect(innerLayout).toExist();
        expect(innerLayout.props.width).toEqual(width - WIDGET_MOBILE_RIGHT_SPACE);
    });
    it('DashBoard with width=640', () => {
        const width = 640;
        const cmp = ReactDOM.render(<TestDashboardContainer style={{width, height: 480}} widgets={[testWidget]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const innerLayout = ReactTestUtils.findRenderedComponentWithType(cmp, Responsive);
        expect(innerLayout).toExist();
        expect(innerLayout.props.width).toEqual(width);
    });
});
