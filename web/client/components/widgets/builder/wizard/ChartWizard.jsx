/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef, memo, useState } from 'react';
import { compose } from 'recompose';
import { isEqual, isEmpty, pick } from "lodash";
import { withResizeDetector } from 'react-resize-detector';

import WizardContainer from '../../../misc/wizard/WizardContainer';
import { wizardHandlers } from '../../../misc/wizard/enhancers';
import loadingEnhancer from '../../../misc/enhancers/loadingState';
import noAttribute from './common/noAttributesEmptyView';
import wfsChartOptions from './common/wfsChartOptions';
import WPSWidgetOptions from './common/WPSWidgetOptions';
import ChartWidgetOptions from './common/WidgetOptions';
import NullManagement from './chart/NullManagement';
import SimpleChart from '../../../charts/SimpleChart';
import ChartAxisOptions from './chart/ChartAxisOptions';
import ChartValueFormatting from './chart/ChartValueFormatting';
import ChartLayoutOptions from './chart/ChartLayoutOptions';
import Message from "../../../I18N/Message";

import sampleData from '../../enhancers/sampleChartData';
import multiProtocolChart from '../../enhancers/multiProtocolChart';
import { chartWidgetProps } from '../../enhancers/chartWidget';
import dependenciesToWidget from '../../enhancers/dependenciesToWidget';
import dependenciesToFilter from '../../enhancers/dependenciesToFilter';
import dependenciesToOptions from '../../enhancers/dependenciesToOptions';
import emptyChartState from '../../enhancers/emptyChartState';
import errorChartState from '../../enhancers/errorChartState';
import ChartStyleEditor from './chart/ChartStyleEditor';
import ChartTraceEditSelector from './chart/ChartTraceEditSelector';
import TraceAxesOptions from './chart/TraceAxesOptions';
import TraceLegendOptions from './chart/TraceLegendOptions';
import { isChartOptionsValid } from '../../../../utils/WidgetsUtils';
import dependenciesToShapes from '../../enhancers/dependenciesToShapes';

const loadingState = loadingEnhancer(({ loading, data }) => loading || !data, { width: 500, height: 200 });
const hasNoAttributes = ({ featureTypeProperties = [] }) => featureTypeProperties.filter(({ type = "" } = {}) => type.indexOf("gml:") !== 0).length === 0;
const NoAttributeComp = noAttribute(hasNoAttributes)(() => null);
const ChartOptionsComp = wfsChartOptions(WPSWidgetOptions);
const ChartStyleEditorComp = wfsChartOptions(ChartStyleEditor);
const ChartNullManagementComp = wfsChartOptions(NullManagement);

const enhancePreview = compose(
    chartWidgetProps,
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    multiProtocolChart,
    loadingState,
    errorChartState,
    emptyChartState,
    dependenciesToShapes
);
const PreviewChart = enhancePreview(withResizeDetector(SimpleChart));
const SampleChart = sampleData(withResizeDetector(SimpleChart));

const Wizard = wizardHandlers(WizardContainer);

const renderPreview = ({
    data = {},
    trace,
    dependencies = {},
    setValid = () => { },
    hasAggregateProcess,
    setErrors = () => {},
    errors,
    widgets = [],
    valid
}) => {
    return valid
        ? (<PreviewChart
            {...data}
            dependencies={dependencies}
            widgets={widgets}
            key="preview-chart"
            isAnimationActive={false}
            onLoad={() => {
                setValid(true);
                setErrors({...errors, [trace.layer.name]: false});
            }}
            onLoadError={() => {
                setValid(false);
                setErrors({...errors, [trace.layer.name]: true});
            }}
        />)
        : (<SampleChart
            hasAggregateProcess={hasAggregateProcess}
            key="sample-chart"
            isAnimationActive={false}
            type={trace.type}
        />);
};

const StepHeader = ({step} = {}) => (
    <div className="ms-wizard-form-separator">
        <Message msgId={`widgets.${step === 0 ? 'advanced.traceData' : 'widgetOptionsTitle'}`}/>
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
    step = 0,
    types,
    featureTypeProperties,
    dependencies,
    hasAggregateProcess,
    widgets = [],
    openFilterEditor,
    toggleLayerSelector,
    valid,
    dashBoardEditing
}) => {
    const selectedChart = (data?.charts || []).find((chart) => chart.chartId === data.selectedChartId);
    const traces = selectedChart?.traces || [];
    const selectedTrace = traces.find(trace => trace.id === data?.selectedTraceId) || traces[0];
    const noAttributes = hasNoAttributes({ featureTypeProperties });
    const prevProps = useRef({});
    const [tab, setTab] = useState('traces');
    useEffect(() => {
        // this side effects where removed from the recompose HOC
        // probably all these could be moved at higher level
        // because the could be computed early
        // this are used to enable/disable buttons in builder toolbar
        if (valid && data?.charts?.some(chart => chart.traces.some((trace) => !isChartOptionsValid(trace.options, { hasAggregateProcess })))) {
            setValid(false);
        }
        if ((isEmpty(prevProps.current.data || {}) && !isEmpty(data)) || !isEqual(prevProps.current.data, data)) {
            const layerNames = data?.charts?.reduce((acc, chart) => [ ...acc, ...chart.traces.map(({ layer } = {}) => layer?.name)], []);
            setErrors(isEmpty(layerNames) ? {} : pick(errors, [...layerNames]));
        }
        prevProps.current = {
            featureTypeProperties,
            data
        };
    });

    if (!selectedTrace) {
        return null;
    }
    const selectedTab = selectedTrace?.type === "pie" && tab === "axis" ? "traces" : (tab);

    if (noAttributes) {
        return <NoAttributeComp featureTypeProperties={featureTypeProperties}/>;
    }
    const sampleChart = (
        <div className="ms-wizard-chart-selector">
            <ChartTraceEditSelector
                data={data}
                editing={step === 0}
                error={!!errors?.[selectedTrace?.layer?.name]}
                onChange={onChange}
                onAddChart={() => toggleLayerSelector(true)}
                disableMultiChart={!dashBoardEditing}
                tab={selectedTab}
                setTab={setTab}
                hasAggregateProcess={hasAggregateProcess}
            >
                <div className="ms-wizard-chart-preview" style={{
                    position: 'relative',
                    height: 250
                }}>
                    {renderPreview({
                        data,
                        trace: selectedTrace,
                        valid: traces.some((t) => isChartOptionsValid(t?.options, { hasAggregateProcess })),
                        dependencies,
                        setValid,
                        hasAggregateProcess,
                        setErrors,
                        errors,
                        widgets
                    })}
                </div>
            </ChartTraceEditSelector>
        </div>
    );

    const tabContents = {
        traces: (
            <>
                <StepHeader step={step} />
                {!noAttributes && <ChartOptionsComp
                    hasAggregateProcess={hasAggregateProcess}
                    dependencies={dependencies}
                    key="chart-options"
                    featureTypeProperties={featureTypeProperties}
                    types={types}
                    data={selectedTrace}
                    onChange={(key, value) => {
                        onChange(`charts[${selectedChart?.chartId}].traces[${selectedTrace.id}].${key}`, value);
                    }}
                    layer={selectedTrace?.layer}
                    disableLayerSelection={!dashBoardEditing}
                    showTitle={false}
                    error={!!errors?.[selectedTrace?.layer?.name]}
                    onChangeLayer={dashBoardEditing ? () => toggleLayerSelector({
                        key: 'chart-layer-replace',
                        chartId: selectedChart?.chartId,
                        traceId: selectedTrace?.id
                    }) : null}
                    onFilterLayer={() => openFilterEditor()}
                />}
                <ChartStyleEditorComp
                    // force the re-rendering on trace change
                    key={selectedTrace?.id}
                    data={selectedTrace}
                    layer={selectedTrace?.layer}
                    featureTypeProperties={featureTypeProperties}
                    traces={traces}
                    onChange={(key, value) =>
                        onChange(`charts[${selectedChart?.chartId}].traces[${selectedTrace.id}].${key}`, value)
                    }
                />
                <TraceAxesOptions
                    data={data}
                    onChange={onChange}
                />
                <ChartValueFormatting
                    title={<Message msgId="widgets.advanced.valueFormatting" />}
                    options={selectedTrace}
                    onChange={(key, value) =>
                        onChange(`charts[${selectedChart?.chartId}].traces[${selectedTrace.id}].${key}`, value)
                    }
                />
                <TraceLegendOptions
                    data={data}
                    onChange={onChange}
                />
                <ChartNullManagementComp
                    data={selectedTrace}
                    onChange={(key, value) => {
                        onChange(`charts[${selectedChart?.chartId}].traces[${selectedTrace.id}].${key}`, value);
                    }}
                    featureTypeProperties={featureTypeProperties}
                />
            </>
        ),
        axis: (
            <ChartAxisOptions
                data={data}
                onChange={onChange}
            />
        ),
        layout: (
            <ChartLayoutOptions
                data={data}
                onChange={onChange}
            />
        )
    };

    const ChartOptions = (
        <>
            {sampleChart}
            {tabContents[selectedTab || 'traces']}
        </>
    );
    const WidgetOptions = !noAttributes ? (
        <>
            {sampleChart}
            <StepHeader step={step} />
            <ChartWidgetOptions
                key="widget-options"
                data={data}
                onChange={onChange}
                layer={selectedChart?.layer}
                showTitle={false}
            />
        </>
    ) : null;
    return (<Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        isStepValid={n =>
            n === 0
                ? data.chartType
                : n === 1
                    ? traces.every(trace => isChartOptionsValid(trace.options, { hasAggregateProcess }))
                    : true
        }
        hideButtons
        className={"chart-options"}>
        {[ChartOptions, WidgetOptions].map(component =>
            <>
                {component}
            </>
        )}
    </Wizard>);
};
export default memo(ChartWizard);
