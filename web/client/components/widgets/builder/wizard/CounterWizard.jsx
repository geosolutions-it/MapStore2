/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import {isNil} from 'lodash';
import React from 'react';
import { compose, lifecycle } from 'recompose';

import loadingEnhancer from '../../../misc/enhancers/loadingState';
import {wizardHandlers} from '../../../misc/wizard/enhancers';
import WizardContainer from '../../../misc/wizard/WizardContainer';
import dependenciesToFilter from '../../enhancers/dependenciesToFilter';
import dependenciesToOptions from '../../enhancers/dependenciesToOptions';
import dependenciesToWidget from '../../enhancers/dependenciesToWidget';
import emptyChartState from '../../enhancers/emptyChartState';
import errorChartState from '../../enhancers/errorChartState';
import wpsCounter from '../../enhancers/wpsCounter';
import Counter from '../../widget/CounterView';
import noAttributes from './common/noAttributesEmptyView';
import wfsChartOptions from './common/wfsChartOptions';
import WidgetOptions from './common/WidgetOptions';
import WPSChartOptions from './common/WPSWidgetOptions';

const loadingState = loadingEnhancer(({loading, data}) => loading || !data, {width: 500, height: 200});

const CounterOptions = compose(
    // reset all groupByAttributes (e.g. if change widget type, the value can remain)
    lifecycle({
        componentDidMount() {
            this.props.onChange && this.props.onChange("options.groupByAttributes", undefined);
        }
    }),
    wfsChartOptions,
    noAttributes(({ options = [] }) => options.length === 0)
)(WPSChartOptions);

export const isCounterOptionsValid = (options = {}, { hasAggregateProcess }) => options.aggregateFunction && options.aggregationAttribute && hasAggregateProcess;
const triggerSetValid = compose(
    lifecycle({
        UNSAFE_componentWillReceiveProps: ({ valid, data = [], options = {}, setValid = () => { }, error, hasAggregateProcess } = {}) => {
            const isNowValid = !isNil(data[0]) && !error;
            if (!!valid !== !!isNowValid && isCounterOptionsValid(options, { hasAggregateProcess })) {
                setValid(isNowValid);
            }
        }
    }));

const enhancePreview = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    wpsCounter,
    triggerSetValid,
    loadingState,
    errorChartState,
    emptyChartState
);

const sampleProps = {
    style: {
        width: 450,
        height: 100
    }
};
const Wizard = wizardHandlers(WizardContainer);


const Preview = enhancePreview(Counter);
const CounterPreview = ({ data = {}, layer, dependencies = {}, valid, setValid = () => { }, hasAggregateProcess }) =>
    !isCounterOptionsValid(data.options, { hasAggregateProcess })
        ? <Counter
            {...sampleProps}
            data={[{ data: 42 }]}
            options={data.options}
            series={[{ dataKey: "data" }]} />
        : <Preview
            hasAggregateProcess={hasAggregateProcess}
            {...sampleProps}
            valid={valid}
            dependenciesMap={data.dependenciesMap}
            dependencies={dependencies}
            setValid={setValid}
            type={data.type}
            legend={data.legend}
            layer={data.layer || layer}
            filter={data.filter}
            geomProp={data.geomProp}
            mapSync={data.mapSync}
            options={data.options} />;

const enhanceWizard = compose(lifecycle({
    UNSAFE_componentWillReceiveProps: ({ data = {}, valid, setValid = () => { }, hasAggregateProcess } = {}) => {
        if (valid && !isCounterOptionsValid(data.options, { hasAggregateProcess })) {
            setValid(false);
        }
    }
})
);
export default enhanceWizard(({ onChange = () => { }, onFinish = () => { }, setPage = () => { }, setValid = () => { }, valid, formOptions, data = {}, layer = {}, step = 0, types, featureTypeProperties, dependencies, hasAggregateProcess }) =>
    (<Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        isStepValid={n => n === 1 ? isCounterOptionsValid(data.options, { hasAggregateProcess }) : true} hideButtons>
        <CounterOptions
            hasAggregateProcess={hasAggregateProcess}
            dependencies={dependencies}
            key="chart-options"
            formOptions={formOptions}
            featureTypeProperties={featureTypeProperties}
            types={types}
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
            sampleChart={<CounterPreview
                hasAggregateProcess={hasAggregateProcess}
                data={data}
                valid={valid}
                layer={data.layer || layer}
                dependencies={dependencies}
                setValid={v => setValid(v && isCounterOptionsValid(data.options, { hasAggregateProcess }))} />}
        />
        <WidgetOptions
            key="widget-options"
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
            sampleChart={<CounterPreview
                hasAggregateProcess={hasAggregateProcess}
                data={data}
                valid={valid}
                layer={data.layer || layer}
                dependencies={dependencies}
                setValid={v => setValid(v && isCounterOptionsValid(data.options, { hasAggregateProcess }))} />}
        />
    </Wizard>));
