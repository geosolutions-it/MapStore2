/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import WizardContainer from '../../../misc/wizard/WizardContainer';
import { wizardHandlers } from '../../../misc/wizard/enhancers';
import loadingEnhancer from '../../../misc/enhancers/loadingState';
import noAttribute from './common/noAttributesEmptyView';
import BaseChartType from './chart/ChartType';
import wfsChartOptions from './common/wfsChartOptions';
import WPSWidgetOptions from './common/WPSWidgetOptions';
import WidgetOptions from './common/WidgetOptions';
import sampleData from '../../enhancers/sampleChartData';
import wpsChart from '../../enhancers/wpsChart';
import dependenciesToWidget from '../../enhancers/dependenciesToWidget';
import dependenciesToFilter from '../../enhancers/dependenciesToFilter';
import dependenciesToOptions from '../../enhancers/dependenciesToOptions';
import emptyChartState from '../../enhancers/emptyChartState';
import errorChartState from '../../enhancers/errorChartState';
import { compose, lifecycle, setDisplayName } from 'recompose';
import SimpleChart from '../../../charts/SimpleChart';

const loadingState = loadingEnhancer(({ loading, data }) => loading || !data, { width: 500, height: 200 });
const hasNoAttributes = ({ featureTypeProperties = [] }) => featureTypeProperties.filter(({ type = "" } = {}) => type.indexOf("gml:") !== 0).length === 0;
const ChartType = noAttribute(
    hasNoAttributes
)(BaseChartType);
const ChartOptions = wfsChartOptions(WPSWidgetOptions);

const enhancePreview = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    wpsChart,
    loadingState,
    errorChartState,
    emptyChartState
);
const PreviewChart = enhancePreview(SimpleChart);
const SampleChart = sampleData(SimpleChart);

const sampleProps = {
    width: 430,
    height: 200
};


const isChartOptionsValid = (options = {}) => options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes;

const Wizard = wizardHandlers(WizardContainer);


const renderPreview = ({ data = {}, layer, dependencies = {}, setValid = () => { } }) => isChartOptionsValid(data.options)
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
    />);

const enhanceWizard = compose(lifecycle({
    UNSAFE_componentWillReceiveProps: ({ data = {}, valid, setValid = () => { } } = {}) => {
        if (valid && !isChartOptionsValid(data.options)) {
            setValid(false);
        }
    }
}),
setDisplayName('ChartWizard')
);
const ChartWizard = ({ onChange = () => { }, onFinish = () => { }, setPage = () => { }, setValid = () => { }, data = {}, layer = {}, step = 0, types, featureTypeProperties, dependencies }) =>
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
            sampleChart={renderPreview({ data, layer: data.layer || layer, dependencies, setValid: v => setValid(v && isChartOptionsValid(data.options)) })}
        />
        <WidgetOptions
            key="widget-options"
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
            sampleChart={renderPreview({ data, layer: data.layer || layer, dependencies, setValid: v => setValid(v && isChartOptionsValid(data.options)) })}
        />
    </Wizard>);
export default enhanceWizard(ChartWizard);
