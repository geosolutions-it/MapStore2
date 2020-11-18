/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { compose, lifecycle } from 'recompose';

import { wizardHandlers } from '../../../misc/wizard/enhancers';
import WizardContainer from '../../../misc/wizard/WizardContainer';
import WidgetOptions from './common/WidgetOptions';
import TableOptions from './table/TableOptions';

const isChartOptionsValid = (options = {}) => options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes;

const Wizard = wizardHandlers(WizardContainer);


const triggerValidationReset = compose(lifecycle({
    UNSAFE_componentWillReceiveProps: ({ data = {}, valid, setValid = () => { } } = {}) => {
        if (valid && !isChartOptionsValid(data.options)) {
            setValid(false);
        }
    }
})
);

export default triggerValidationReset(({ onChange = () => { }, onFinish = () => { }, setPage = () => { }, data = {}, layer = {}, step = 0, types, featureTypeProperties, dependencies }) =>
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
