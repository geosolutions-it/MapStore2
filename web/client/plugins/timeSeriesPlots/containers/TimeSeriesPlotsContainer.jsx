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

import Dock from 'react-dock';

import {compose, withProps} from 'recompose';
import { CONTROL_NAME } from '../constants';
import ChartView from '@mapstore/components/widgets/widget/ChartView';
import { SelectionTable } from '../components/SelectionTable';
import Dialog from "../../../components/misc/Dialog";
import MainToolbar from '../components/MainToolbar';
import Message from '../../../components/I18N/Message';
import { Resizable } from 'react-resizable';
import { toggleControl } from '../../../actions/controls';
import { changeAggregateFunction, changeTraceColor, removeTableSelectionRow } from '../actions/timeSeriesPlots';
import { getDefaultAggregationOperations } from '@mapstore/utils/WidgetsUtils';

import {
    enabledSelector,
    timePlotsDataSelector,
    timeSeriesFeaturesSelectionsSelector,
    aggregateFunctionSelector
} from '../selectors/timeSeriesPlots';
import localizedProps from '../../../components/misc/enhancers/localizedProps';

/**
 * Main Panel of TimeSeriesPlotsContainer
 * @param {*} param0
 * @returns
 */

const Panel = ({ 
    enabled,
    onChangeAggregateFunction = () => {},
    onChangeTraceColor = () => {},
    onClose = () => {},
    timePlotsData,
    onRemoveTableSelectionRow = () => {},
    aggregationOptions,
    aggregateFunction
}) => {
    const margin = 10;
    const initialSize = {width: 400, height: 400};
    const [size, setSize] = useState(initialSize);
    if (!enabled) {
        return null;
    }

    const getTimeSeriesChartProps = (data) => {
        const aggregateFunctions = data.map(item => item.aggregateFunctionOption.value);
        const aggregationAttribute = '(VALUE)';
        return ({
            cartesian: true,
            legend: true,
            options : {
                aggregateFunctions,
                aggregationAttribute,
                groupByAttributes: 'DATE',
            },
            names: data.reduce((acc, cur) => {
                const seriesName = data.filter(item => cur.selectionId === item.selectionId)[0]?.selectionName || '';
                return [
                    ...acc,
                    { dataKey: seriesName }
                ]
            }, []),
            series: [{ dataKey: aggregationAttribute }],
            type: 'line',
            tracesColors: data.map(item => item.traceColor),
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
                    minConstraints={[350, 400]}
                    onResize={(event, {size: newSize}) => {
                        setSize(newSize);
                    }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: "column",
                        width: size.width,
                        height: size.height
                    }}>
                        <MainToolbar />
                        <SelectionTable
                            aggregationOptions={aggregationOptions}
                            timeSeriesFeaturesSelections={timePlotsData}
                            onRemoveTableSelectionRow={onRemoveTableSelectionRow}
                            onChangeAggregateFunction={onChangeAggregateFunction}
                            onChangeTraceColor={onChangeTraceColor}/>
                        <div style={{
                            flex: 1,
                            width: '100%',
                            position: 'relative'
                        }}>
                        <Dock position="bottom" dimMode="none" fluid isVisible zIndex={0} dockStyle={{
                            maxHeight: '90%',
                            minHeight: '3%'
                        }}>
                            <ChartView
                                {...getTimeSeriesChartProps(timePlotsData)}
                                data={timePlotsData.map(item => item.chartData) || []} />
                        </Dock>
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
    timeSeriesFeaturesSelections: timeSeriesFeaturesSelectionsSelector,
    aggregateFunction: aggregateFunctionSelector
}), {
    onClose: () => toggleControl(CONTROL_NAME),
    onRemoveTableSelectionRow: (selectionId) => removeTableSelectionRow(selectionId),
    onChangeTraceColor: (selectionId, color) => changeTraceColor(selectionId, color),
    onChangeAggregateFunction: (selectionId, aggregateFunction) => changeAggregateFunction(selectionId, aggregateFunction)
})(Panel);

export default compose(
    withProps(props => ({
        aggregationOptions: getDefaultAggregationOperations(),
        aggregateFunction: props.aggregateFunction
    })),
    localizedProps(["aggregationOptions", "aggregateFunction"])
)(TSPPanel);