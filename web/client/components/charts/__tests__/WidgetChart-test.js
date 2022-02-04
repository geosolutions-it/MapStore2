
import React from 'react';
import ReactDOM from 'react-dom';
import WidgetChart, { toPlotly, defaultColorGenerator, COLOR_DEFAULTS } from '../WidgetChart';

import expect from 'expect';
import {
    CLASSIFICATIONS,
    DATASET_1,
    DATASET_2,
    DATASET_3,
    LABELLED_CLASSIFICATION,
    UNLABELLED_CLASSIFICATION,
    PIE_CHART_TEMPLATE_LABELS_CLASSIFICATION,
    SPLIT_DATASET_2,
    SPLIT_DATASET_3,
    TEMPLATE_LABELS_CLASSIFICATION
} from './sample_data';

describe('WidgetChart', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering pie', (done) => {
        const check = ({ data, layout }, graphDiv) => {
            expect(graphDiv).toExist();
            expect(layout.showLegend).toBeFalsy();
            expect(layout.autosize).toBeFalsy();
            expect(layout.automargin).toBeFalsy();
            expect(layout.legend).toBeFalsy();
            expect(data.length).toEqual(1);
            // use yAxis dataKey as default label
            expect(data[0].name).toEqual(DATASET_1.series[0].dataKey);
            // data values mapped
            data[0].values.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.series[0].dataKey]));
            // data labels mapped
            data[0].labels.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.xAxis.dataKey]));
            done();
        };
        ReactDOM.render(<WidgetChart onInitialized={check} {...DATASET_1} type="pie" />, document.getElementById("container"));
    });
    it('rendering line', (done) => {
        const check = ({ data, layout }, graphDiv) => {
            expect(graphDiv).toExist();
            expect(layout.showLegend).toBeFalsy();
            expect(layout.autosize).toBeFalsy();
            expect(layout.automargin).toBeFalsy();
            expect(layout.hovermode).toBe('x unified');
            expect(data.length).toEqual(1);
            // use yAxis dataKey as default label
            expect(data[0].name).toEqual(DATASET_1.series[0].dataKey);
            // data values mapped
            data[0].y.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.series[0].dataKey]));
            // data labels mapped
            data[0].x.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.xAxis.dataKey]));
            done();
        };
        ReactDOM.render(<WidgetChart onInitialized={check} {...DATASET_1} type="line" />, document.getElementById("container"));
    });
    it('rendering bar', (done) => {
        const check = ({ data, layout }, graphDiv) => {
            expect(graphDiv).toExist();
            expect(layout.showLegend).toBeFalsy();
            expect(layout.autosize).toBeFalsy();
            expect(layout.automargin).toBeFalsy();
            expect(layout.hovermode).toBe('x unified');
            expect(data.length).toEqual(1);
            // use yAxis dataKey as default label
            expect(data[0].name).toEqual(DATASET_1.series[0].dataKey);
            // data values mapped
            data[0].y.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.series[0].dataKey]));
            // data labels mapped
            data[0].x.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.xAxis.dataKey]));
            done();
        };
        ReactDOM.render(<WidgetChart onInitialized={check} {...DATASET_1} type="bar" />, document.getElementById("container"));
    });
});


const TYPES = ['pie', 'line', 'bar'];

describe('Widget Chart: data conversions ', () => {
    describe('common options', () => {
        function testAllTypes(props, handler) {
            TYPES.map(type => toPlotly({
                type,
                ...props
            })).map(handler);
        }
        it('defaults', () => {
            testAllTypes(DATASET_1, ({data, config, layout}) => {
                // default settings valid for all chart types
                expect(layout.showLegend).toBeFalsy();
                expect(layout.autosize).toBeFalsy();
                expect(layout.automargin).toBeFalsy();
                expect(data.length).toEqual(1);
                // use yAxis dataKey as default label
                expect(data[0].name).toEqual(DATASET_1.series[0].dataKey);
                // hide logo
                expect(config.displaylogo).toBeFalsy();
            });
        });
        const THRESHOLD = 350;
        it('test dimension are passed', () => {
            testAllTypes({ ...DATASET_1, width: 200, height: 200 }, ({ layout }) => {
                expect(layout.width).toBe(200);
                expect(layout.height).toBe(200);
            });
        });
        it(`show toolbar only if witdth > ${THRESHOLD}, with correct margin`, () => {
            testAllTypes({ ...DATASET_1, width: THRESHOLD }, ({ config, layout }) => {
                expect(config.displayModeBar).toEqual(false);
                expect(layout.margin.t).toEqual(5);
            });
            testAllTypes({ ...DATASET_1, width: THRESHOLD + 1 }, ({ config, layout }) => {
                expect(config.displayModeBar).toEqual(true);
                expect(layout.margin.t).toEqual(20);
            });
        });
        it('show legend', () => {
            testAllTypes({ ...DATASET_1, legend: true }, ({ layout }) => {
                expect(layout.showlegend).toBeTruthy();
            });
        });
    });
    describe('Pie chart', () => {
        it('basic chart options', () => {
            const { data, layout } = toPlotly({
                type: 'pie',
                ...DATASET_1
            });
            // DATA
            expect(data.length).toBe(1);
            expect(data[0].type).toBe('pie');
            // this avoids text to overflow the chart div when rendered outside the widget
            expect(data[0].textposition).toEqual('inside');
            // data values mapped
            data[0].values.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.series[0].dataKey]));
            // data labels mapped
            data[0].labels.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.xAxis.dataKey]));
            // LAYOUT
            expect(layout.margin).toEqual({t: 5, b: 5, l: 2, r: 2, pad: 4}); // fixed margins
            // colors generated are the defaults, generated on data (1 color for each entry)
            expect(layout.colorway).toEqual(defaultColorGenerator(data[0].values.length, COLOR_DEFAULTS));
        });
        it('Pie chart with modified options', () => {
            const { data, layout } = toPlotly({
                type: 'pie',
                width: 500,
                ...DATASET_1
            });
            // DATA
            expect(data.length).toBe(1);
            expect(data[0].type).toBe('pie');
            expect(data[0].textposition).toEqual('inside');
            // data values mapped
            data[0].values.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.series[0].dataKey]));
            // data labels mapped
            data[0].labels.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.xAxis.dataKey]));
            // LAYOUT
            expect(layout.margin).toEqual({t: 20, b: 5, l: 2, r: 2, pad: 4}); // Modified margin based on width
            // colors generated are the defaults, generated on data (1 color for each entry)
            expect(layout.colorway).toEqual(defaultColorGenerator(data[0].values.length, COLOR_DEFAULTS));
            expect(layout.legend).toBeTruthy();
            expect(layout.legend).toEqual({x: 1.05, y: 0.5}); // Legend option to right and centered based on width
        });
        it('custom colors', () => {
            const autoColorOptions = { base: 190, range: 20 };
            const { data, layout } = toPlotly({
                type: 'pie',
                autoColorOptions,
                ...DATASET_1
            });
            expect(layout.colorway).toEqual(defaultColorGenerator(data[0].values.length, autoColorOptions));
        });
        it('custom classified colors - using custom labels and colors only', () => {
            const autoColorOptions = { defaultCustomColor: "#00ff00", defaultClassLabel: "Default", classification: LABELLED_CLASSIFICATION, name: 'global.colors.custom' };
            const { data, layout } = toPlotly({
                type: 'pie',
                autoColorOptions,
                classifications: CLASSIFICATIONS,
                ...DATASET_2
            });
            expect(data.length).toBe(1);
            expect(data[0].type).toBe('pie');
            expect(data[0].textposition).toEqual('inside');
            // data values mapped
            data[0].values.map((v, i) => expect(v).toBe(DATASET_2.data[i][DATASET_2.series[0].dataKey]));
            // data labels mapped
            data[0].labels.map((v, i) => {
                const classLabel = LABELLED_CLASSIFICATION.filter(item => item.value === DATASET_2.data[i][CLASSIFICATIONS.dataKey])[0].title;
                expect(v).toBe(classLabel);
            });
            // colors are those defined by the user
            data[0].marker.colors.map((v, i) => {
                const classColor = LABELLED_CLASSIFICATION.filter(item => item.value === DATASET_2.data[i][CLASSIFICATIONS.dataKey])[0].color;
                expect(v).toBe(classColor);
            });
            // LAYOUT
            expect(layout.margin).toEqual({t: 5, b: 5, l: 2, r: 2, pad: 4}); // fixed margins
        });
        it('custom classified colors - using default labels and colors', () => {
            const autoColorOptions = { defaultCustomColor: "#00ff00", defaultClassLabel: "", classification: UNLABELLED_CLASSIFICATION, name: 'global.colors.custom' };
            const { data, layout } = toPlotly({
                type: 'pie',
                autoColorOptions,
                classifications: CLASSIFICATIONS,
                ...DATASET_3
            });
            expect(data.length).toBe(1);
            expect(data[0].type).toBe('pie');
            expect(data[0].textposition).toEqual('inside');
            // data values mapped
            data[0].values.map((v, i) => expect(v).toBe(DATASET_3.data[i][DATASET_3.series[0].dataKey]));
            // data labels mapped
            data[0].labels.map((v, i) => {
                expect(v).toBe(DATASET_3.data[i][DATASET_3.xAxis.dataKey]);
            });
            // colors are those defined by the user
            data[0].marker.colors.map((v, i) => {
                const classColor = UNLABELLED_CLASSIFICATION.filter(item => item.value === DATASET_3.data[i][CLASSIFICATIONS.dataKey])[0]?.color ?? autoColorOptions.defaultCustomColor;
                expect(v).toBe(classColor);
            });
            // LAYOUT
            expect(layout.margin).toEqual({t: 5, b: 5, l: 2, r: 2, pad: 4}); // fixed margins
        });
        it('custom classified colors - using templatized labels and custom colors only - pie charts', () => {
            const autoColorOptions = { defaultCustomColor: "#00ff00", defaultClassLabel: "", classification: PIE_CHART_TEMPLATE_LABELS_CLASSIFICATION, name: 'global.colors.custom' };
            const { data, layout } = toPlotly({
                type: 'pie',
                autoColorOptions,
                classifications: CLASSIFICATIONS,
                ...DATASET_2
            });
            expect(data.length).toBe(1);
            expect(data[0].type).toBe('pie');
            expect(data[0].textposition).toEqual('inside');
            // data values mapped
            data[0].values.map((v, i) => expect(v).toBe(DATASET_2.data[i][DATASET_2.series[0].dataKey]));
            // data labels mapped
            data[0].labels.map((v, i) => {
                const classLabel = PIE_CHART_TEMPLATE_LABELS_CLASSIFICATION
                    .filter(item => item.value === DATASET_2.data[i][CLASSIFICATIONS.dataKey])[0].title
                    .replace('${groupByValue}', DATASET_2.data[i].name);
                expect(v).toBe(classLabel);
            });
            // colors are those defined by the user
            data[0].marker.colors.map((v, i) => {
                const classColor = PIE_CHART_TEMPLATE_LABELS_CLASSIFICATION.filter(item => item.value === DATASET_2.data[i][CLASSIFICATIONS.dataKey])[0].color;
                expect(v).toBe(classColor);
            });
            // LAYOUT
            expect(layout.margin).toEqual({t: 5, b: 5, l: 2, r: 2, pad: 4}); // fixed margins
        });
        it('custom color ramp', () => {
            const autoColorOptions = {
                defaultCustomColor: "#00FF00",
                defaultClassLabel: "Default",
                name: 'global.colors.custom',
                base: 190,
                range: 0,
                s: 0.95,
                v: 0.63
            };
            const { data } = toPlotly({
                type: 'pie',
                autoColorOptions,
                ...DATASET_2
            });
            expect(data.length).toBe(1);
            expect(data[0].type).toBe('pie');
            expect(data[0].textposition).toEqual('inside');
            data[0].marker.colors.map((v) => {
                expect(v).toBe(autoColorOptions.defaultCustomColor);
            });
        });
    });
    describe('Line/Bar chart common features', () => {
        function testAllTypes(props, handler) {
            ['line', 'bar'].map(type => toPlotly({
                type,
                ...props
            })).map(handler);
        }
        it('basic line/bar options', () => {
            testAllTypes(DATASET_1, ({data, layout}) => {
                // DATA
                expect(data.length).toBe(1);
                // expect(data[0].type).toBe('line');

                // data values mapped
                data[0].y.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.series[0].dataKey]));
                // data labels mapped
                data[0].x.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.xAxis.dataKey]));
                // LAYOUT

                // minimal margins, bottom automatic
                expect(layout.margin).toEqual({ t: 5, b: 30, l: 5, r: 5, pad: 4 });

                // colors generated are the defaults, generated on series (1 color for series, so 1)
                expect(layout.colorway).toEqual(defaultColorGenerator(1, COLOR_DEFAULTS));

                // yaxis
                expect(layout.yaxis.automargin).toBeTruthy();
                expect(layout.yaxis.showticklabels).toBeFalsy();
                expect(layout.yaxis.showgrid).toBeFalsy();

                // xaxis
                expect(layout.xaxis.automargin).toBeTruthy();
                expect(layout.xaxis.tickangle).toEqual('auto');
            });
        });
        it('yAxisLabel to be used as name of the chart', () => {
            testAllTypes({
                ...DATASET_1,
                yAxisLabel: "TEST_LABEL"
            }, ({ data }) => {
                expect(data[0].name).toEqual("TEST_LABEL");
            });
        });
        it('cartesian to show/hide grid', () => {
            testAllTypes({
                ...DATASET_1,
                cartesian: true
            }, ({ layout }) => {
                // bottom margin is optimized
                expect(layout.yaxis.showgrid).toBe(true);
                expect(layout.margin).toEqual({ t: 5, b: 30, l: 5, r: 5, pad: 4 });
            });

        });
        it('nTicks passed to force to show all labels, max nTicks', () => {
            testAllTypes({
                ...DATASET_1,
                xAxisOpts: { nTicks: 200}
            }, ({ layout }) => {
                // bottom margin is optimized
                expect(layout.xaxis.nticks).toBe(200);
            });

        });

        it('check yAxis, prefix, format, suffix', () => {
            testAllTypes({
                ...DATASET_1,
                yAxisOpts: { tickPrefix: "test", format: ".2s", tickSuffix: "W/h" }
            }, ({ layout }) => {
                // bottom margin is optimized
                expect(layout.yaxis.tickprefix).toBe("test");
                expect(layout.yaxis.tickformat).toBe(".2s");
                expect(layout.yaxis.ticksuffix).toBe("W/h");
            });
        });
        it('check formula', () => {
            testAllTypes({
                ...DATASET_1,
                formula: "value * 2"
            }, ({ data }) => {
                // bottom margin is optimized
                data[0].y.map((v, i) => expect(v).toBe(DATASET_1.data[i][DATASET_1.series[0].dataKey] * 2));
            });
        });
    });
    describe('color coded/custom classified Bar chart', () => {
        it('custom classified colors - using custom labels and colors only', () => {
            const autoColorOptions = { defaultCustomColor: "#00ff00", defaultClassLabel: "Default", classification: LABELLED_CLASSIFICATION, name: 'global.colors.custom' };
            const { data, layout } = toPlotly({
                type: 'bar',
                autoColorOptions,
                classifications: CLASSIFICATIONS,
                ...DATASET_2
            });
            expect(data.length).toBe(1);
            const traces = data[0];
            expect(traces.length).toBe(2);
            traces.forEach((trace, i) => {
                expect(trace.type).toBe('bar');
                // data values mapped
                trace.y.map((v, j) => expect(v).toBe(SPLIT_DATASET_2.data[i][j][SPLIT_DATASET_2.series[0].dataKey]));
                trace.x.map((v, j) => expect(v).toBe(SPLIT_DATASET_2.data[i][j][SPLIT_DATASET_2.xAxis.dataKey]));
                // data labels mapped
                const classLabel = LABELLED_CLASSIFICATION.filter(item => item.value === SPLIT_DATASET_2.data[i][0][CLASSIFICATIONS.dataKey])[0]?.title;
                expect(trace.name).toBe(classLabel);
                // colors are those defined by the user
                const classColor = LABELLED_CLASSIFICATION.filter(item => item.value === SPLIT_DATASET_2.data[i][0][CLASSIFICATIONS.dataKey])[0].color;
                trace.marker.color.forEach(item => expect(item).toBe(classColor));
                expect(layout.margin).toEqual({ t: 5, b: 30, l: 5, r: 5, pad: 4 });
            });
        });
    });
    it('custom classified colors - using default labels and colors', () => {
        const autoColorOptions = { defaultCustomColor: "#00ff00", defaultClassLabel: "Default", classification: UNLABELLED_CLASSIFICATION, name: 'global.colors.custom' };
        const { data, layout } = toPlotly({
            type: 'bar',
            autoColorOptions,
            classifications: CLASSIFICATIONS,
            ...DATASET_3
        });
        expect(data.length).toBe(1);
        const traces = data[0];
        expect(traces.length).toBe(3);
        traces.forEach((trace, i) => {
            expect(trace.type).toBe('bar');
            // data values mapped
            trace.y.map((v, j) => expect(v).toBe(SPLIT_DATASET_3.data[i][j][SPLIT_DATASET_3.series[0].dataKey]));
            trace.x.map((v, j) => expect(v).toBe(SPLIT_DATASET_3.data[i][j][SPLIT_DATASET_3.xAxis.dataKey]));
            // data labels mapped
            const classLabel = UNLABELLED_CLASSIFICATION.filter(item => item.value === SPLIT_DATASET_3.data[i][0][CLASSIFICATIONS.dataKey])[0]?.value ?? autoColorOptions.defaultClassLabel;
            expect(trace.name).toBe(classLabel);
            // colors are those defined by the user
            const classColor = UNLABELLED_CLASSIFICATION.filter(item => item.value === SPLIT_DATASET_3.data[i][0][CLASSIFICATIONS.dataKey])[0]?.color ?? autoColorOptions.defaultCustomColor;
            trace.marker.color.forEach(item => expect(item).toBe(classColor));
            expect(layout.margin).toEqual({ t: 5, b: 30, l: 5, r: 5, pad: 4 });
        });
    });
    it('custom classified colors - using templatized labels and custom colors only - bar charts', () => {
        const autoColorOptions = { defaultCustomColor: "#00ff00", defaultClassLabel: "Default", classification: TEMPLATE_LABELS_CLASSIFICATION, name: 'global.colors.custom' };
        const { data, layout } = toPlotly({
            type: 'bar',
            autoColorOptions,
            classifications: CLASSIFICATIONS,
            ...DATASET_2
        });
        expect(data.length).toBe(1);
        const traces = data[0];
        expect(traces.length).toBe(2);
        traces.forEach((trace, i) => {
            expect(trace.type).toBe('bar');
            // data values mapped
            trace.y.map((v, j) => expect(v).toBe(SPLIT_DATASET_2.data[i][j][SPLIT_DATASET_2.series[0].dataKey]));
            trace.x.map((v, j) => expect(v).toBe(SPLIT_DATASET_2.data[i][j][SPLIT_DATASET_2.xAxis.dataKey]));
            // data labels mapped
            const classLabel = TEMPLATE_LABELS_CLASSIFICATION
                .filter(item => item.value === SPLIT_DATASET_2.data[i][0][CLASSIFICATIONS.dataKey])[0]?.title
                .replace('${legendValue}', SPLIT_DATASET_2.series[0].dataKey);
            expect(trace.name).toBe(classLabel);
            // colors are those defined by the user
            const classColor = TEMPLATE_LABELS_CLASSIFICATION.filter(item => item.value === SPLIT_DATASET_2.data[i][0][CLASSIFICATIONS.dataKey])[0].color;
            trace.marker.color.forEach(item => expect(item).toBe(classColor));
            expect(layout.margin).toEqual({ t: 5, b: 30, l: 5, r: 5, pad: 4 });
        });
    });
    it('custom bar color', () => {
        const autoColorOptions = {
            defaultCustomColor: "#0888A1",
            defaultClassLabel: "Default",
            name: 'global.colors.custom',
            base: 190,
            range: 0,
            s: 0.95,
            v: 0.63
        };
        const { data, layout } = toPlotly({
            type: 'bar',
            autoColorOptions,
            ...DATASET_2
        });
        expect(data.length).toBe(1);
        expect(data[0].type).toBe('bar');
        expect(layout.colorway).toEqual([autoColorOptions.defaultCustomColor]);
    });
    it('default classfied bar chart type is stacked', () => {
        const autoColorOptions = { defaultCustomColor: "#00ff00", defaultClassLabel: "Default", classification: LABELLED_CLASSIFICATION, name: 'global.colors.custom' };
        const { data, layout } = toPlotly({
            type: 'bar',
            autoColorOptions,
            classifications: CLASSIFICATIONS,
            ...DATASET_2
        });
        expect(data.length).toBe(1);
        const traces = data[0];
        expect(traces.length).toBe(2);
        expect(layout.barmode).toBe('stack');
    });
    it('change classfied bar chart type to grouped', () => {
        const autoColorOptions = { defaultCustomColor: "#00ff00", defaultClassLabel: "Default", classification: LABELLED_CLASSIFICATION, name: 'global.colors.custom' };
        const { data, layout } = toPlotly({
            type: 'bar',
            autoColorOptions,
            classifications: CLASSIFICATIONS,
            ...DATASET_2,
            barChartType: 'group'
        });
        expect(data.length).toBe(1);
        const traces = data[0];
        expect(traces.length).toBe(2);
        expect(layout.barmode).toBe('group');
    });
});
