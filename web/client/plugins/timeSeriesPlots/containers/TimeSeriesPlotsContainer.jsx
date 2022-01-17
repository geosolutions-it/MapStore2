/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';

import { CONTROL_NAME } from '../constants';
import ChartView from '@mapstore/components/widgets/widget/ChartView';
import { SelectionTable } from '../components/SelectionTable';
import Dialog from "../../../components/misc/Dialog";
import MainToolbar from '../components/MainToolbar';
import Message from '../../../components/I18N/Message';
import { Resizable } from 'react-resizable';
import { toggleControl } from '../../../actions/controls';

import {
    enabledSelector,
    timePlotsDataSelector
} from '../selectors/timeSeriesPlots';

/**
 * Main Panel of TimeSeriesPlotsContainer
 * @param {*} param0
 * @returns
 */

const Panel = ({ enabled, onClose = () => {}, timePlotsData }) => {
    const margin = 10;
    const initialSize = {width: 400, height: 300};
    const [size, setSize] = useState(initialSize);
    if (!enabled) {
        return null;
    }

    const timeSeriesChartProps = {
        cartesian: true,
        legend: true,
        options : {
            aggregateFunction: 'Average',
            aggregationAttribute: 'VALUE',
            groupByAttributes: 'DATE',
        },
        series: [{dataKey: 'Average(VALUE)'}],
        type: 'line',
        xAxis: {dataKey: 'DATE'},
        yAxis: true
    }

    return (
        <Dialog
            bodyClassName="time-series-plots-window-body"
            draggable
            style={{
                zIndex: 10000,
                position: "absolute",
                left: "17%",
                top: "50px",
                margin: 0,
                width: size.width}}>
            <span
                role="header"
                style={{ display: "flex", justifyContent: "space-between" }}
            >
                <span>
                    <Message msgId={"timeSeriesPlots.title"} />
                </span>
                <button onClick={() => {onClose(); setSize(initialSize)}} className="close">
                    <Glyphicon glyph="1-close" />
                </button>
            </span>
            <div
                role="body"
                style={ { height: size.height,  display: "flex" }}
            >
                <Resizable
                    width={size.width}
                    height={size.height}
                    minConstraints={[190, 50]}
                    onResize={(event, {size: newSize}) => {
                        setSize(newSize);
                    }}
                >
                    <div style={{
                       
                        flexDirection: "column",
                        width: size.width,
                        height: size.height
                    }}>
                        <MainToolbar enabled={enabled} />
                        <SelectionTable />
                        <div className='ms2-border-layout-body' style={ { display: "flex", flex: "1 1 0%", overflowY: "auto"}}>
                            <main className='ms2-border-layout-content' style={{ flex: "1 1 0%" }}>
                                <div className='mapstore-widget-chart' style={{ position: 'relative' }}>
                                    <ChartView
                                    {...timeSeriesChartProps}
                                    data={timePlotsData.map(item => item.chartData)[0] || []} />
                                </div>
                            </main>
                        </div>
                    </div>
                    {/* <div style={ { flex: "1 1 0%" }}>
                    <SimpleChart
                            {...timeSeriesChartProps}
                            data={timePlotsData.map(item => item.chartData)[0] || []} />
                    </div> */}

                </Resizable>

            </div>
        </Dialog>
    );
}

const TSPPanel = connect(createStructuredSelector({
    enabled: enabledSelector,
    timePlotsData: timePlotsDataSelector
}), {
    onClose: () => toggleControl(CONTROL_NAME)
})(Panel);

export default TSPPanel;