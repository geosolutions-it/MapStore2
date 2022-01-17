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
import { removeTableSelectionRow } from '../actions/timeSeriesPlots';

import {
    enabledSelector,
    timePlotsDataSelector,
    timeSeriesFeaturesSelectionsSelector
} from '../selectors/timeSeriesPlots';

/**
 * Main Panel of TimeSeriesPlotsContainer
 * @param {*} param0
 * @returns
 */

const Panel = ({ 
    enabled,
    onClose = () => {},
    timePlotsData,
    timeSeriesFeaturesSelections = [],
    onRemoveTableSelectionRow = () => {} 
}) => {
    const margin = 10;
    const initialSize = {width: 400, height: 300};
    const [size, setSize] = useState(initialSize);
    if (!enabled) {
        return null;
    }

    const getTimeSeriesChartProps = (data, selections) => {
        const aggregateFunction = 'Average';
        const aggregationAttribute = 'VALUE'
        const operationName = `${aggregateFunction}(${aggregationAttribute})`;
        return ({
            cartesian: true,
            legend: true,
            options : {
                aggregateFunction,
                aggregationAttribute,
                groupByAttributes: 'DATE',
            },
            names: data.reduce((acc, cur) => {
                const seriesName = selections.filter(item => cur.selectionId === item.selectionId)[0]?.selectionName || '';
                return [
                    ...acc,
                    { dataKey: seriesName }
                ]
            }, []),
            series: [{ dataKey: operationName }],
            type: 'line',
            xAxis: {dataKey: 'DATE'},
            yAxis: true
        });
    };

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
                        <SelectionTable 
                            timeSeriesFeaturesSelections={timeSeriesFeaturesSelections}
                            onRemoveTableSelectionRow={onRemoveTableSelectionRow}/>
                        <div className='ms2-border-layout-body' style={ { display: "flex", flex: "1 1 0%", overflowY: "auto"}}>
                            <main className='ms2-border-layout-content' style={{ flex: "1 1 0%" }}>
                                <div className='mapstore-widget-chart' style={{ position: 'relative' }}>
                                    <ChartView
                                    {...getTimeSeriesChartProps(timePlotsData, timeSeriesFeaturesSelections)}
                                    data={timePlotsData.map(item => item.chartData) || []} />
                                </div>
                            </main>
                        </div>
                    </div>
                </Resizable>

            </div>
        </Dialog>
    );
}

const TSPPanel = connect(createStructuredSelector({
    enabled: enabledSelector,
    timePlotsData: timePlotsDataSelector,
    timeSeriesFeaturesSelections: timeSeriesFeaturesSelectionsSelector
}), {
    onClose: () => toggleControl(CONTROL_NAME),
    onRemoveTableSelectionRow: (selectionId) => removeTableSelectionRow(selectionId)
})(Panel);

export default TSPPanel;