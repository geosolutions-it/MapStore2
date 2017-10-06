/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { Sector, Cell, PieChart, Pie} = require('recharts');
const {convertToNameValue} = require('./polar');
/*
// sample colorData
const colorData = [{
        value: 1, // Meaning span is 0 to 40
        color: '#663399'
    }, {
        value: 2, // span 40 to 140
        color: '#e91e63'
    }, {
        value: 3, // span 140 to 190
        color: '#ff9800'
    }, {
        value: 4,
        color: '#4caf50'
    }
];
 */
const GaugeChart = ({data, xAxis = {}, color, series = [], width=500, height = 500, useActive=false, cols=2, customCellHeight, maxValue, isAnimationActive}) => {
    const seriesArray = Array.isArray(series) ? series : [series];

    const cellWidth = (width / cols);
    const cellHeight = customCellHeight || height / Math.floor((seriesArray.length || 1) / cols) * 0.75;
    const centers = seriesArray.map( (e, i) => ({
        cx: (i % cols + 0.5) * cellWidth,
        cy: (Math.floor(i / cols) + 0.7) * cellHeight
    }));
    /*
    const centers = data.map( (e, i) => ({
        cx: (i % cols) * (width / cols) + (width / cols / 2),
        cy: Math.floor(i / cols) * height / Math.floor((seriesArray.length || 1) / cols) + height / Math.floor((seriesArray.length || 1) / cols) / 2
    }));
    */
    const serie = seriesArray[0] || {};
    const max = isNaN(maxValue)
        ? convertToNameValue({name: xAxis && xAxis.dataKey || serie.name, value: serie.dataKey || serie.value}, data).reduce( (a, c) => Math.max(c.value, a), Number.NEGATIVE_INFINITY)
        : maxValue;
    const colorData = [{
        value: max,
        color
    }];
    return (
        <PieChart width={width} height={height}>
            {
            convertToNameValue({name: xAxis && xAxis.dataKey || serie.name, value: serie.dataKey || serie.value}, data).map((d, i) => {
                const pieW = width / cols;
                const ActiveSectorMark = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill}) => {
                    return (
                        <g>
                            <Sector
                                cx={cx}
                                cy={cy}
                                innerRadius={innerRadius}
                                outerRadius={outerRadius * 1.2}
                                startAngle={startAngle}
                                endAngle={endAngle}
                                fill={fill}
                            />
                        </g>
                    );
                };
                const Arrow = ({ cx, cy, midAngle, outerRadius }) => {
                    const RADIAN = Math.PI / 180;
                    const sin = Math.sin(-RADIAN * midAngle);
                    const cos = Math.cos(-RADIAN * midAngle);
                    const mx = cx + (outerRadius + pieW * 0.03) * cos;
                    const my = cy + (outerRadius + pieW * 0.03) * sin;
                    return (
                        <g width={pieW}>
                            <text text-anchor="middle" alignment-baseline="central" x={cx} y={cy - outerRadius * 1.5} >{d.name}</text>
                            <text text-anchor="middle" alignment-baseline="central" x={cx} y={cy - outerRadius * 1.2} >{d.value}</text>
                            <circle cx={cx} cy={cy} r={pieW * 0.05} fill="#666" stroke="none"/>
                            <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth="6" stroke="#666" fill="none" strokeLinecap="round"/>
                        </g>
                    );
                };

                const chartValue = d.value;
                const activeSectorIndex = colorData.map((cur, index, arr) => {
                    const curMax = [...arr]
                        .splice(0, index + 1)
                        .reduce((a, b) => ({ value: a.value + b.value }))
                        .value;
                    return (chartValue > (curMax - cur.value)) && (chartValue <= curMax);
                })
                .findIndex(cur => cur);

                const sumValues = colorData
                    .map(cur => cur.value)
                    .reduce((a, b) => a + b);

                const arrowData = [
                    { value: chartValue },
                    { value: 0 },
                    { value: sumValues - chartValue }
                ];

                const pieProps = {
                    startAngle: 180,
                    endAngle: 0,
                    cx: centers[i].cx || 0,
                    cy: centers[i].cy || 0
                };

                const pieRadius = {
                    innerRadius: (pieW / 2) * 0.35,
                    outerRadius: (pieW / 2) * 0.4
                };


                return [<Pie
                    isAnimationActive={isAnimationActive}
                    activeIndex={activeSectorIndex}
                    activeShape={useActive && ActiveSectorMark}
                    data={colorData}
                    fill="#8884d8"
                    { ...pieRadius }
                    { ...pieProps }
                >
                    {
                        colorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colorData[index].color} />
                        ))
                    }
                </Pie>,
                <Pie
                    isAnimationActive={isAnimationActive}
                    stroke="none"
                    activeIndex={1}
                    activeShape={ Arrow }
                    data={ arrowData }
                    outerRadius={ pieRadius.innerRadius }
                    fill="none"
                    { ...pieProps }
                    legend
                />];
            })}
        </PieChart>
    );
};

module.exports = GaugeChart;
