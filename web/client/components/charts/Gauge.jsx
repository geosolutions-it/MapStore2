/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { Sector, Cell, PieChart, Pie, Tooltip} = require('recharts');
const {convertToNameValue} = require('./polar');
const calculateCellHeight = ({customCellHeight, height, rows}) => customCellHeight || ( height - 20 ) / rows;
const calculateCellWidth = ({width, cols}) => width / cols;
const calculateRows = ({data, cols}) => Math.ceil((data.length) / cols);
const adjustCols = ({cols, rows, cellWidth, cellHeight, height, width, data = []}) => {
    if ( 2 * cellHeight < cellWidth) {
        const newCols = Math.min(data.length, Math.ceil(data.length / (height / cellWidth * 2)));
        return {
            cols: newCols,
            rows: calculateRows({data, cols: newCols}),
            cellWidth: calculateCellWidth({width, cols: newCols}),
            cellHeight: calculateCellHeight({height, rows: calculateRows({data, cols: newCols})})
        };
    }
    return {
        cols,
        rows,
        cellWidth,
        cellHeight
    };
};
const calculateCells = ({width, height, data = [], customCellHeight}) => {
    // try with a square NxN
    let cols = Math.floor(Math.sqrt(data.length));
    // if data is less calculated cells, use full width, with a max of 20 charts per row
    cols = Math.min(cols, data.length, 20);
    const cellWidth = calculateCellWidth({width, cols});
    const rows = calculateRows({data, cols});
    const cellHeight = calculateCellHeight({customCellHeight, height, rows});
    return adjustCols({
        data,
        height,
        width,
        cols,
        rows,
        cellWidth,
        cellHeight
    });
};
const GaugeChart = ({data, xAxis = {}, colorGenerator, series = [], width = 500, height = 500, useActive = false, customCellHeight, tooltip, legend, maxValue, isAnimationActive}) => {
    const seriesArray = Array.isArray(series) ? series : [series];
    const {cols, rows, cellWidth, cellHeight} = calculateCells({width, height, data, customCellHeight});
    const centers = data.map( (e, i) => ({
        cx: (i % cols + 0.5) * cellWidth,
        cy: (Math.floor(i / cols)) * cellHeight + 5
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
    const COLORS = colorGenerator(2);
    const colorData = [{
        value: max,
        color: COLORS[0]
    }];
    return (
        <PieChart width={cellWidth * cols} height={cellHeight * rows + 20}>
            {tooltip
                ? <Tooltip content={({payload, label}) =>
                    (<div style={{backgroundColor: "#FFF", padding: 5, border: "1px solid #CCCCCC" }}>
                        {`${label || payload && payload[0] && payload[0].name || ""} : ${payload && payload[0] && (payload[0].realValue || payload[0].value)}`}
                    </div>)}/>
                : null}
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
                        const mx = cx + (outerRadius + pieW * 0.1) * cos;
                        const my = cy + (outerRadius + pieW * 0.1) * sin;
                        return (
                            <g width={pieW}>
                                <circle cx={cx} cy={cy} r={pieW * 0.05} fill={COLORS[1]} stroke="none"/>
                                <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth={pieW * 0.06} stroke="#999999" strokeLinecap="round"/>
                                <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth={pieW * 0.05} stroke={COLORS[1]} fill={COLORS[1]} strokeLinecap="round"/>
                                {legend ? <text textAnchor={"middle"} width={pieW} x={cx} y={cy - outerRadius * 1.5} >{(d.value).toFixed(2)}</text> : null}
                                {legend
                                    ? (<text style={{
                                        fill: "#000000", stroke: "#000000", fontSize: pieW * 0.1
                                    }} textAnchor={"middle"} width={pieW} x={cx} y={cy} >{d.name}</text>)
                                    : null}
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
                        { value: chartValue, realValue: chartValue, name: d.name },
                        { value: 0, realValue: chartValue, name: d.name },
                        { value: sumValues - chartValue, realValue: chartValue, name: d.name }
                    ];

                    const pieProps = {
                        startAngle: 180,
                        endAngle: 0,
                        cx: centers[i] && centers[i].cx || 0,
                        cy: centers[i] && centers[i].cy + cellHeight || 0
                    };

                    const pieRadius = {
                        innerRadius: (pieW / 2) * 0.5,
                        outerRadius: (pieW / 2) * 0.9
                    };


                    return [<Pie
                        key={`pie-${i}`}
                        isAnimationActive={isAnimationActive}
                        activeIndex={activeSectorIndex}
                        activeShape={useActive ? ActiveSectorMark : undefined}
                        data={colorData.map( cd => ({realValue: chartValue, name: d.name, ...cd}))}
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
