/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose, lifecycle, setDisplayName, withState } from 'recompose';
import { isEqual, isEmpty, pick } from "lodash";

import WizardContainer from '../../../misc/wizard/WizardContainer';
import { wizardHandlers } from '../../../misc/wizard/enhancers';
import loadingEnhancer from '../../../misc/enhancers/loadingState';
import noAttribute from './common/noAttributesEmptyView';
import BaseChartType from './chart/ChartType';
import wfsChartOptions from './common/wfsChartOptions';
import WPSWidgetOptions from './common/WPSWidgetOptions';
import ChartWidgetOptions from './common/WidgetOptions';
import SimpleChart from '../../../charts/SimpleChart';
import ChartSwitcher from "../wizard/chart/ChartSwitcher";
import Message from "../../../I18N/Message";

import sampleData from '../../enhancers/sampleChartData';
import multiProtocolChart from '../../enhancers/multiProtocolChart';
import dependenciesToWidget from '../../enhancers/dependenciesToWidget';
import dependenciesToFilter from '../../enhancers/dependenciesToFilter';
import dependenciesToOptions from '../../enhancers/dependenciesToOptions';
import emptyChartState from '../../enhancers/emptyChartState';
import errorChartState from '../../enhancers/errorChartState';

const loadingState = loadingEnhancer(({ loading, data }) => loading || !data, { width: 500, height: 200 });
const hasNoAttributes = ({ featureTypeProperties = [] }) => featureTypeProperties.filter(({ type = "" } = {}) => type.indexOf("gml:") !== 0).length === 0;
const ChartType = noAttribute(hasNoAttributes)(BaseChartType);
const ChartOptionsComp = wfsChartOptions(WPSWidgetOptions);

const enhancePreview = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    multiProtocolChart,
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

export const isChartOptionsValid = (options = {}, { hasAggregateProcess }) => {
    return (
        options.aggregationAttribute
        && options.groupByAttributes
        // if aggregate process is not present, the aggregateFunction is not necessary. if present, is mandatory
        && (!hasAggregateProcess || hasAggregateProcess && options.aggregateFunction)
        || options.classificationAttribute
    );
};

const Wizard = wizardHandlers(WizardContainer);

const renderPreview = ({ data = {}, layer, dependencies = {}, setValid = () => { }, hasAggregateProcess, setErrors = () => {}, errors, widgets = [] }) => isChartOptionsValid(data.options, { hasAggregateProcess })
    ? (<PreviewChart
        {...sampleProps}
        key="preview-chart"
        onLoad={() => {
            setValid(true);
            setErrors({...errors, [layer.name]: false});
        }}
        onLoadError={() => {
            setValid(false);
            setErrors({...errors, [layer.name]: true});
        }}
        id={data.id}
        isAnimationActive={false}
        dependencies={dependencies}
        dependenciesMap={data.dependenciesMap}
        type={data.type}
        xAxisOpts={data.xAxisOpts}
        yAxisOpts={data.yAxisOpts}
        barChartType={data.barChartType}
        formula={data.formula}
        legend={data.legend}
        cartesian={data.cartesian}
        layer={data.layer || layer}
        charts={data.charts || []}
        selectedChartId={data.selectedChartId}
        filter={data.filter || {}}
        geomProp={data.geomProp}
        mapSync={data.mapSync}
        autoColorOptions={data.autoColorOptions}
        options={data.options || []}
        yAxis={data.yAxis}
        xAxisAngle={data.xAxisAngle}
        yAxisLabel={data.yAxisLabel}
        widgets={widgets}
    />)
    : (<SampleChart
        hasAggregateProcess={hasAggregateProcess}
        key="sample-chart"
        isAnimationActive={false}
        {...sampleProps}
        type={data.type}
        autoColorOptions={data.autoColorOptions}
        legend={data.legend}
        cartesian={data.cartesian}
        layer={data.layer || layer}
        yAxis={data.yAxis}
    />);

const enhanceWizard = compose(
    withState('selectedChart', "setSelectedChart", {}),
    lifecycle({
        componentDidMount() {
            const data = this.props?.data || {};
            const chartData = {...data, ...data?.charts?.find(c => c.chartId === data?.selectedChartId)};
            this.props?.setSelectedChart({...chartData});
        },
        UNSAFE_componentWillReceiveProps({
            data = {},
            valid,
            setValid = () => { },
            hasAggregateProcess,
            selectedChart,
            setSelectedChart,
            setErrors = () => {},
            errors,
            featureTypeProperties,
            setNoAttributes = () => {}
        } = {}) {
            const matchedChart = {...data, ...data?.charts?.find(c => c.chartId === data?.selectedChartId)};
            if (valid && data?.charts?.some(chart => !isChartOptionsValid(chart.options, { hasAggregateProcess }))) {
                setValid(false);
            }
            if ((isEmpty(selectedChart) && !isEmpty(matchedChart)) || !isEqual(selectedChart, matchedChart)) {
                const layerNames = matchedChart?.charts?.map(({layer} = {}) => layer?.name);
                setErrors(isEmpty(layerNames) ? {} : pick(errors, [...layerNames]));
                setSelectedChart({...matchedChart});
            }
            const noAttributes = hasNoAttributes({featureTypeProperties});
            if (!isEqual(featureTypeProperties, this.props.featureTypeProperties) ) {
                setNoAttributes(noAttributes);
            }
        }
    }),
    setDisplayName('ChartWizard')
);

const StepHeader = ({step} = {}) => (
    <div className="chart-option-title">
        <Message msgId={`widgets.${step === 0 ? 'chartOptionsTitle' : 'widgetOptionsTitle'}`}/>
    </div>
);

const ChartWizard = ({
    onChange = () => {},
    onFinish = () => {},
    setPage = () => {},
    setValid = () => {},
    data = {},
    setErrors = () => {},
    errors,
    selectedChart = {},
    setSelectedChart = () => {},
    layer = {},
    step = 0,
    types,
    featureTypeProperties,
    dependencies,
    hasAggregateProcess,
    noAttributes = false,
    withContainer = true, // To render charts switcher in container mode. And to allow test overrides
    widgets = []
}) => {
    const sampleChart = renderPreview({
        hasAggregateProcess,
        data: selectedChart,
        layer: selectedChart?.layer || layer,
        dependencies,
        setErrors,
        errors,
        setValid,
        widgets
    });
    const ChartOptions = (
        <>
            <ChartType
                key="type"
                featureTypeProperties={featureTypeProperties}
                type={selectedChart?.type}
                onSelect={(val) => onChange(`charts[${selectedChart?.chartId}].type`, val)} />
            {!noAttributes && <ChartOptionsComp
                hasAggregateProcess={hasAggregateProcess}
                dependencies={dependencies}
                key="chart-options"
                featureTypeProperties={featureTypeProperties}
                types={types}
                data={selectedChart}
                onChange={(key, value)=>onChange(`charts[${selectedChart?.chartId}].${key}`, value)}
                layer={selectedChart?.layer || layer}
                sampleChart={sampleChart}
                showTitle={false}
            />}
        </>
    );
    const WidgetOptions = !noAttributes ? (
        <ChartWidgetOptions
            key="widget-options"
            data={data}
            onChange={onChange}
            layer={selectedChart?.layer || layer}
            sampleChart={sampleChart}
            showTitle={false}
        />
    ) : null;
    return (<Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        isStepValid={n =>
            n === 0
                ? data.chartType
                : n === 1
                    ? isChartOptionsValid(data.options, { hasAggregateProcess })
                    : true
        }
        hideButtons
        className={"chart-options"}>
        {[ChartOptions, WidgetOptions].map(component =>
            <>
                <StepHeader step={step}/>
                <ChartSwitcher
                    key="chart-switcher"
                    editorData={data}
                    onChange={onChange}
                    value={data?.selectedChartId}
                    setSelectedChart={setSelectedChart}
                    selectedChart={selectedChart}
                    featureTypeProperties={featureTypeProperties}
                    withContainer={withContainer}
                >
                    {component}
                </ChartSwitcher>
            </>
        )}
    </Wizard>);
};
export default enhanceWizard(ChartWizard);
