 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const React = require('react');
const { XAxis, YAxis, CartesianGrid} = require('recharts');
const AxisLabel = require('./AxisLabel');

const renderCartesianTools = ({xAxis, yAxis, cartesian, ...props}) => ([
    xAxis && xAxis.show !== false ? <XAxis key="xaxis" {...xAxis}/> : null,
    yAxis ? <YAxis key="yaxis" label={<AxisLabel axisType="yAxis" x={50} y={125} width={0} height={0} children={props.yAxisLabel}/>} axisLine={false} tick={false} tickLine={false}/> : null,
    cartesian !== false ? <CartesianGrid key="cartesiangrid" {...cartesian}/> : null]);
module.exports = {renderCartesianTools};
