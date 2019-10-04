/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const { wizardHandlers } = require('../../../misc/wizard/enhancers');

const TableOptions = require('./table/TableOptions');
const WidgetOptions = require('./common/WidgetOptions');
const isChartOptionsValid = (options = {}) => options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes;

const Wizard = wizardHandlers(require('../../../misc/wizard/WizardContainer'));

const { compose, lifecycle } = require('recompose');

const triggerValidationReset = compose(lifecycle({
    UNSAFE_componentWillReceiveProps: ({ data = {}, valid, setValid = () => { } } = {}) => {
        if (valid && !isChartOptionsValid(data.options)) {
            setValid(false);
        }
    }
})
);

module.exports = triggerValidationReset(({ onChange = () => { }, onFinish = () => { }, setPage = () => { }, data = {}, layer = {}, step = 0, types, featureTypeProperties, dependencies }) =>
    (<Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        isStepValid={n => n === 1 ? isChartOptionsValid(data.options) : true} hideButtons>
        <TableOptions
            dependencies={dependencies}
            key="chart-options"
            featureTypeProperties={featureTypeProperties}
            types={types}
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
        />
        <WidgetOptions
            key="widget-options"
            data={data}
            onChange={onChange}
            layer={data.layer || layer}
        />
    </Wizard>));
