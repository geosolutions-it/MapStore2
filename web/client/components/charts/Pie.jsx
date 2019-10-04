/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {pure} = require('recompose');
const {PieChart, Pie, Cell} = require('recharts');
const {convertToNameValue} = require('./polar');

module.exports = pure(({ isAnimationActive, width = 600, height = 300, data, series = [], xAxis, colorGenerator, maxCols = 3, ...props} = {}) => {
    const seriesArray = Array.isArray(series) ? series : [series];
    const cols = Math.min(maxCols, seriesArray.length);
    const COLORS = colorGenerator(data.length);
    const cellWidth = (width / cols);
    const cellHeight = height / Math.floor((seriesArray.length || 1) / cols);
    const centers = seriesArray.map( (e, i) => ({
        cx: (i % cols + 0.5) * cellWidth,
        cy: (Math.floor(i / cols) + 0.5) * cellHeight
    }));
    const cells = data.map( (emtry, i) => <Cell key={`cell-${i}`}fill={COLORS[i]} />);
    return (<PieChart width={width} height={height} data={data}>
        {
            seriesArray.map((serie = {}, i) =>
                (<Pie key={`pie-${i}`} isAnimationActive={isAnimationActive}
                    {...centers[i]}
                    data={convertToNameValue({name: xAxis && xAxis.dataKey || serie.name, value: serie.dataKey || serie.value}, data)}
                    {...serie}
                    outerRadius={Math.min(cellWidth / 2, cellHeight / 2)}>
                    {cells}
                </Pie>))
        }
        {props.children}
    </PieChart>);
});
