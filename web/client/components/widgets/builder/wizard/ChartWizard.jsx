/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const { wizardHandlers } = require('../../../misc/wizard/enhancers');
const loadingState = require('../../../misc/enhancers/loadingState')(({ loading, data }) => loading || !data, { width: 500, height: 200 });
const noAttribute = require('./common/noAttributesEmptyView');
const hasNoAttributes = ({ featureTypeProperties = [] }) => featureTypeProperties.filter(({ type = ""} = {}) => type.indexOf("gml:") !== 0).length === 0;
const ChartType = noAttribute(
    hasNoAttributes
)(require('./chart/ChartType'));
const wfsChartOptions = require('./common/wfsChartOptions');
const ChartOptions = wfsChartOptions(require('./common/WPSWidgetOptions'));
const WidgetOptions = require('./common/WidgetOptions');
const sampleData = require('../../enhancers/sampleChartData');
const wpsChart = require('../../enhancers/wpsChart');
const dependenciesToWidget = require('../../enhancers/dependenciesToWidget');
const dependenciesToFilter = require('../../enhancers/dependenciesToFilter');
const dependenciesToOptions = require('../../enhancers/dependenciesToOptions');
const emptyChartState = require('../../enhancers/emptyChartState');
const errorChartState = require('../../enhancers/errorChartState');
const { compose, lifecycle } = require('recompose');
const enhancePreview = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    wpsChart,
    loadingState,
    errorChartState,
    emptyChartState
);
const PreviewChart = enhancePreview(require('../../../charts/SimpleChart'));
const SampleChart = sampleData(require('../../../charts/SimpleChart'));

const sampleProps = {
    width: 430,
    height: 200
};


const isChartOptionsValid = (options = {}) => options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes;

const Wizard = wizardHandlers(require('../../../misc/wizard/WizardContainer'));


const renderPreview = ({ data = {}, layer, dependencies = {}, setValid = () => { }, shortenChartLabelThreshold }) => isChartOptionsValid(data.options)
    ? (<PreviewChart
        key="preview-chart"
        onLoad={() => setValid(true)}
        onLoadError={() => setValid(false)}
        isAnimationActive={false}
        dependencies={dependencies}
        dependenciesMap={data.dependenciesMap}
        {...sampleProps}
        type={data.type}
        legend={data.legend}
        cartesian={data.cartesian}
        layer={data.layer || layer}
        filter={data.filter}
        geomProp={data.geomProp}
        mapSync={data.mapSync}
        autoColorOptions={data.autoColorOptions}
        options={data.options}
        yAxis={data.yAxis}
        xAxisAngle={data.xAxisAngle}
        yAxisLabel={data.yAxisLabel}
        shortenChartLabelThreshold={shortenChartLabelThreshold}
    />)
    : (<SampleChart
        key="sample-chart"
        isAnimationActive={false}
        {...sampleProps}
        type={data.type}
        autoColorOptions={data.autoColorOptions}
        legend={data.legend}
        cartesian={data.cartesian}
        yAxis={data.yAxis}
        shortenChartLabelThreshold={shortenChartLabelThreshold}
    />);

const enhanceWizard = compose(lifecycle({
    UNSAFE_componentWillReceiveProps: ({ data = {}, valid, setValid = () => { } } = {}) => {
        if (valid && !isChartOptionsValid(data.options)) {
            setValid(false);
        }
    }
})
);
module.exports = enhanceWizard(({ onChange = () => { }, onFinish = () => { }, setPage = () => { }, setValid = () => { }, data = {}, layer = {}, step = 0, types, featureTypeProperties, dependencies, shortenChartLabelThreshold }) =>
    (<Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        isStepValid={n =>
            n === 0
                ? data.chartType
                : n === 1
                    ? isChartOptionsValid(data.options)
                    : true
        } hideButtons>
        <ChartType
            key="type"
            featureTypeProperties={featureTypeProperties}
            type={data.type}
            onSelect={i => {
                onChange("type", i);
            }} />
        <ChartOptions
            dependencies={dependencies}
            key="chart-options"
            featureTypeProperties={featureTypeProperties}
            types={types}
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
            sampleChart={renderPreview({ data, layer: data.layer || layer, dependencies, setValid: v => setValid(v && isChartOptionsValid(data.options)), shortenChartLabelThreshold })}
        />
        <WidgetOptions
            key="widget-options"
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
            sampleChart={renderPreview({ data, layer: data.layer || layer, dependencies, setValid: v => setValid(v && isChartOptionsValid(data.options)), shortenChartLabelThreshold })}
        />
    </Wizard>));
