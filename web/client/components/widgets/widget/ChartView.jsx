/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';
import ContainerDimensions from 'react-container-dimensions';

import loadingState from '../../misc/enhancers/loadingState';
import errorChartState from '../enhancers/errorChartState';
import emptyChartState from '../enhancers/emptyChartState';
import SimpleChart from '../../charts/SimpleChart';

const EnhancedChart = loadingState()(errorChartState(emptyChartState((SimpleChart))));

/**
 * This is the main chart view component for widgets.
 * Adds to the chart the loading, error, empty state enhancers and wrap it into
 * a chart with a ContainerDimensions, that allow to pass the current size of the
 * div to the chart.
 */
const ChartView = (props) => (<div className="mapstore-widget-chart">
    <ContainerDimensions>
        <EnhancedChart {...props} />
    </ContainerDimensions>
</div>);
export default ChartView;
