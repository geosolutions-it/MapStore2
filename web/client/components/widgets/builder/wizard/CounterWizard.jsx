/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {isNil} = require('lodash');
const { compose, lifecycle } = require('recompose');

const {wizardHandlers} = require('../../../misc/wizard/enhancers');
const loadingState = require('../../../misc/enhancers/loadingState')(({loading, data}) => loading || !data, {width: 500, height: 200});
const wfsChartOptions = require('./common/wfsChartOptions');
const noAttributes = require('./common/noAttributesEmptyView');

const CounterOptions = wfsChartOptions(noAttributes(({options = []}) => options.length === 0)(require('./common/WPSWidgetOptions')));
const WidgetOptions = require('./common/WidgetOptions');

const wpsCounter = require('../../enhancers/wpsCounter');
const dependenciesToFilter = require('../../enhancers/dependenciesToFilter');
const dependenciesToOptions = require('../../enhancers/dependenciesToOptions');
const dependenciesToWidget = require('../../enhancers/dependenciesToWidget');
const emptyChartState = require('../../enhancers/emptyChartState');
const errorChartState = require('../../enhancers/errorChartState');

const isCounterOptionsValid = (options = {}) => options.aggregateFunction && options.aggregationAttribute;
const triggerSetValid = compose(
    lifecycle({
        UNSAFE_componentWillReceiveProps: ({ valid, data = [], options = {}, setValid = () => { }, error } = {}) => {
            const isNowValid = !isNil(data[0]) && !error;
            if (!!valid !== !!isNowValid && isCounterOptionsValid(options)) {
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

const Wizard = wizardHandlers(require('../../../misc/wizard/WizardContainer'));


const Counter = require('../../widget/CounterView');
const Preview = enhancePreview(Counter);
const CounterPreview = ({ data = {}, layer, dependencies = {}, valid, setValid = () => { } }) =>
    !isCounterOptionsValid(data.options)
        ? <Counter
            {...sampleProps}
            data={[{data: 42}]}
            options={data.options}
            series={[{dataKey: "data"}]} />
        : <Preview
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
    UNSAFE_componentWillReceiveProps: ({data = {}, valid, setValid = () => {}} = {}) => {
        if (valid && !isCounterOptionsValid(data.options)) {
            setValid(false);
        }
    }})
);
module.exports = enhanceWizard(({ onChange = () => { }, onFinish = () => { }, setPage = () => { }, setValid = () => { }, valid, formOptions, data = {}, layer = {}, step = 0, types, featureTypeProperties, dependencies}) =>
    (<Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        isStepValid={n => n === 1 ? isCounterOptionsValid(data.options) : true} hideButtons>
        <CounterOptions
            dependencies={dependencies}
            key="chart-options"
            formOptions={formOptions}
            featureTypeProperties={featureTypeProperties}
            types={types}
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
            sampleChart={<CounterPreview
                data={data}
                valid={valid}
                layer={data.layer || layer}
                dependencies={dependencies}
                setValid={v => setValid(v && isCounterOptionsValid(data.options))} />}
        />
        <WidgetOptions
            key="widget-options"
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
            sampleChart={<CounterPreview
                data={data}
                valid={valid}
                layer={data.layer || layer}
                dependencies={dependencies}
                setValid={v => setValid(v && isCounterOptionsValid(data.options))} />}
        />
    </Wizard>));
