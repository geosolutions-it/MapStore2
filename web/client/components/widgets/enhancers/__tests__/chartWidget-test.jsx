/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ReactDOM from "react-dom";
import chartWidget, {chartWidgetProps} from "../chartWidget";
import {createSink} from "recompose";
import expect from "expect";
import React from "react";

describe('chartWidget enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('chartWidget default', (done) => {
        const Sink = chartWidget(createSink(props => {
            expect(props).toBeTruthy();
            expect(props.toggleTableView).toBeTruthy();
            expect(props.showTable).toBeFalsy();
            done();
        }));
        ReactDOM.render(<Sink/>, document.getElementById("container"));
    });
    it('chartWidgetProps default', (done) => {
        const Sink = chartWidgetProps(createSink(props => {
            expect(props).toBeTruthy();
            expect(props).toEqual({charts: [], selectedChartId: undefined, options: {}});
            done();
        }));
        ReactDOM.render(<Sink/>, document.getElementById("container"));
    });
    it('chartWidgetProps on selected chart Id', (done) => {
        const charts = [{chartId: '1', layer: {name: "Test"}}, {chartId: '2'}];
        const Sink = chartWidgetProps(createSink(props => {
            expect(props).toBeTruthy();
            expect(props.charts).toEqual(charts);
            expect(props.selectedChartId).toEqual("1");
            expect(props.chartId).toEqual("1");
            expect(props.layer.name).toEqual("Test");
            done();
        }));
        ReactDOM.render(<Sink charts={charts} selectedChartId={"1"}/>, document.getElementById("container"));
    });
});
