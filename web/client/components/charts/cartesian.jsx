 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const React = require('react');
const { XAxis, YAxis, CartesianGrid} = require('recharts');

const renderCartesianTools = ({xAxis, yAxis, cartesian}) => ([
    xAxis && xAxis.show !== false ? <XAxis key="xaxis" {...xAxis}/> : null,
    yAxis && yAxis.show !== false ? <YAxis key="yaxis" {...yAxis}/> : null,
    cartesian !== false ? <CartesianGrid key="cartesiangrid" {...cartesian}/> : null]);
module.exports = {renderCartesianTools};
