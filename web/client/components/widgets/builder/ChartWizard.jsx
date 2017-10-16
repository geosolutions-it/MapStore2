 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {controlledWizard} = require('../../misc/wizard/enhancers');
const loadingState = require('../../misc/enhancers/loadingState')(({loading, data}) => loading || !data, {width: 500, height: 200});
const Wizard = controlledWizard(require('../../misc/wizard/WizardContainer'));
const ChartType = require('./wizard/chart/ChartType');
const wfsChartOptions = require('./wizard/chart/wfsChartOptions');
const ChartOptions = wfsChartOptions(require('./wizard/chart/ChartOptions'));

const dataHolder = require('../enhancers/dataHolder');
const layerOpts = {url: "http://demo.geo-solutions.it/geoserver/wfs", layer: {name: "topp:states"}};

const sampleData = require('../enhancers/sampleChartData');
const wpsChart = require('../enhancers/wpsChart');
const PreviewChart = sampleData(wpsChart(loadingState(require('../../charts/SimpleChart'))));
const SampleChart = sampleData(require('../../charts/SimpleChart'));

const sampleProps = {
    legend: {
        layout: "vertical",
        align: "left",
        verticalAlign: "middle"
    },
    width: 500,
    height: 200
};
const isChartOptionsValid = options => options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes;

module.exports = dataHolder(({onChange = () => {}, data}) =>
    (<Wizard isStepValid={ n => n === 1 ? isChartOptionsValid(data) : true} skipButtonsOnSteps={[0]}>
        <ChartType onSelect={(i) => {
            onChange("type", i);
        }}/>
    <ChartOptions
        data={data}
        onChange={onChange}
        {...layerOpts}
        sampleChart={
            isChartOptionsValid(data)
            ? (<PreviewChart
                isAnimationActive={false}
                {...sampleProps}
                type={data.type}
                url={"http://demo.geo-solutions.it/geoserver/wfs"}
                layer={{name: "top:states"}}
                options={data}
                />)
            : (<SampleChart
                isAnimationActive={false}
                {...sampleProps}
                type={data.type} />)
            }
    />
    </Wizard>));
