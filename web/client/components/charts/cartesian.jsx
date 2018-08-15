 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const React = require('react');
const{isString, isNumber, truncate,inRange}=require('lodash')
const { XAxis, YAxis, CartesianGrid,Text} = require('recharts');

const customize = (label)=>(
    isString(label)?
        truncate(label,{'length': 5})
        :isNumber(label)?
            label
    :null
)

const CustomizedTick = ({x, y,height, payload}) => (
    <Text style={{fill:'#666'}} x={x} y={y+height/2} angle ={-45} textAnchor="middle" >
    {customize(payload.value)}
    </Text>
);

const renderCartesianTools = ({xAxis, yAxis, cartesian}) => ([
    xAxis && xAxis.show !== false ? <XAxis key="xaxis" tick={<CustomizedTick/>} {...xAxis}/> : null,
    yAxis ? <YAxis key="yaxis" {...yAxis}/> : null,
    cartesian !== false ? <CartesianGrid key="cartesiangrid" {...cartesian}/> : null]);
module.exports = {renderCartesianTools};
