 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {wizardHanlders} = require('../../misc/wizard/enhancers');
const loadingState = require('../../misc/enhancers/loadingState')(({loading, data}) => loading || !data, {width: 500, height: 200});
const Wizard = wizardHanlders(require('../../misc/wizard/WizardContainer'));
const ChartType = require('./wizard/chart/ChartType');
const wfsChartOptions = require('./wizard/chart/wfsChartOptions');
const ChartOptions = wfsChartOptions(require('./wizard/chart/ChartOptions'));
const WidgetOptions = require('./wizard/chart/WidgetOptions');
const sampleData = require('../enhancers/sampleChartData');
const wpsChart = require('../enhancers/wpsChart');
const PreviewChart = wpsChart(loadingState(require('../../charts/SimpleChart')));
const SampleChart = sampleData(require('../../charts/SimpleChart'));

const sampleProps = {
    width: 400,
    height: 200
};


const isChartOptionsValid = (options = {}) => options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes;

const renderPreview = ({data = {}, layer}) => isChartOptionsValid(data.options)
    ? (<PreviewChart
        key="preview-chart"
        isAnimationActive={false}
        {...sampleProps}
        type={data.type}
        legend={data.legend}
        layer={data.layer || layer}
        autoColorOptions={data.autoColorOptions}
        options={data.options}
        />)
    : (<SampleChart
        isAnimationActive={false}
        {...sampleProps}
        type={data.type}
        autoColorOptions={data.autoColorOptions}
        legend={data.legend} />);


module.exports = ({onChange = () => {}, onFinish = () => {}, setPage= () => {}, data = {}, layer ={}, step=0}) =>
    (<Wizard
        step={step}
        setPage={setPage}
        onFinish={() => {
            onFinish({layer: data.layer || layer, url: layer.url, ...data});
        }}
        isStepValid={ n => n === 1 ? isChartOptionsValid(data.options) : true} skipButtonsOnSteps={[0]}>
        <ChartType onSelect={(i) => {
            onChange("type", i);
        }}/>
    <ChartOptions
        data={data}
        onChange={onChange}
        layer={data.layer || layer}
        sampleChart={renderPreview({data, layer: data.layer || layer})}
    />
    <WidgetOptions
        data={data}
        onChange={onChange}
        layer={data.layer || layer}
        sampleChart={renderPreview({data, layer: data.layer || layer})}
    />
    </Wizard>);
