 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


import React from 'react';
import { XAxis, YAxis, CartesianGrid} from 'recharts';

export const CustomizedAxisTick = ({x, y, payload, xAxisAngle = 0}) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform={`rotate(-${xAxisAngle})`}>{payload.value}</text>
        </g>
    );
};

export const renderCartesianTools = ({xAxis, yAxis, cartesian, xAxisAngle = 0} = {}) => ([
    xAxis && xAxis.show !== false ? <XAxis
        key="xaxis"
        {...xAxis}
        interval={xAxisAngle > 0 ? 0 : undefined}
        tick={<CustomizedAxisTick xAxisAngle={xAxisAngle}/>}
        /> : null,
    yAxis ? <YAxis key="yaxis" {...yAxis}/> : null,
    cartesian !== false ? <CartesianGrid key="cartesiangrid" {...cartesian}/> : null] );
