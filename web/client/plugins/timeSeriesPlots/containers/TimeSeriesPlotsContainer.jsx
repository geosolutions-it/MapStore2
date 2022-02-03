/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import { clearAllSelections, changeAggregateFunction, changeSelectionName, changeTraceColor, removeTableSelectionRow } from '../actions/timeSeriesPlots';
import { getDefaultAggregationOperations } from '@mapstore/utils/WidgetsUtils';
import { zoomToExtent } from '@mapstore/actions/map';

import {
    enabledSelector,
    timePlotsDataSelector,
    timeSeriesFeaturesSelectionsSelector,
    aggregateFunctionSelector
} from '../selectors/timeSeriesPlots';
import localizedProps from '../../../components/misc/enhancers/localizedProps';
import { zoomToPoint } from '../../../actions/map';


const getTimeSeriesChartProps = (data) => {
    const aggregateFunctions = data.map(item => item.aggregateFunctionOption.value);
    const aggregationAttribute = '(VALUE)';
    return ({
        cartesian: true,
        legend: true,
        options : {
            aggregateFunctions,
            aggregationAttribute,
            groupByAttributes: data.map(item => item.groupByAttributes || 'DATE'),
            multipleSeries: data.reduce((acc, cur) => (
                [
                    ...acc,
                    { dataKey: cur.aggregateFunctionLabel !== 'No Operation' ? 
                        `${cur.aggregateFunctionOption.value}${cur.aggregationAttribute}`: 
                        cur.aggregationAttribute 
                    }
                ]
            ), []),
            presetLabelNames: data.reduce((acc, cur) => {
                const seriesName = data.filter(item => cur.selectionId === item.selectionId)[0]?.selectionName || '';
                return [
                    ...acc,
                    { dataKey: seriesName }
                ]
            }, []),
            tracesColors: data.map(item => item.traceColor)
        },
        series: [{ dataKey: aggregationAttribute }],
        type: 'line',
        xAxis: {dataKey: 'DATE'},
        yAxis: true
    });
};


const getTimeSeriesPlotsData = (data) => (data.map(item => item.chartData) || []);

/**
 * Main Panel of TimeSeriesPlotsContainer
 * @param {*} param0
 * @returns
 */

const Panel = ({ 
    enabled,
    onChangeAggregateFunction = () => {},
    onChangeSelectionName = () => {},
    onChangeTraceColor = () => {},
    onClearAllSelections = () => {},
    onClose = () => {},
    timePlotsData,
    onRemoveTableSelectionRow = () => {},
    onZoomToSelectionExtent = () => {},
    onZoomToSelectionPoint = () => {},
    aggregationOptions
}) => {
    const margin = 10;
    const initialSize = {width: 630, height: 530};
    const [size, setSize] = useState(initialSize);
    const timeSeriesChartsProps = useMemo(() => getTimeSeriesChartProps(timePlotsData), [timePlotsData]);
    const timeSeriesPlotsData = useMemo(() => getTimeSeriesPlotsData(timePlotsData), [timePlotsData]);

    if (!enabled) {
        return null;
    }

    return (
        <Dialog
            bodyClassName="time-series-plots-window-body"
            draggable
            style={{
                zIndex: 10000,
                position: "absolute",
                left: "20%",
                top: "-145px",
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
                        window.dispatchEvent(new Event('resize'));
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
                            onZoomToSelectionExtent={onZoomToSelectionExtent}
                            onZoomToSelectionPoint={onZoomToSelectionPoint}
                            aggregationOptions={aggregationOptions}
                            timeSeriesFeaturesSelections={timePlotsData}
                            onRemoveTableSelectionRow={onRemoveTableSelectionRow}
                            onChangeAggregateFunction={onChangeAggregateFunction}
                            onChangeSelectionName={onChangeSelectionName}
                            onChangeTraceColor={onChangeTraceColor}
                            onClearAllSelections={onClearAllSelections}/>
                        <div style={{
                            flex: 1,
                            width: '100%',
                            position: 'relative'
                        }}>
                        <ChartView
                            {...timeSeriesChartsProps}
                            data={timeSeriesPlotsData} />
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
    onClearAllSelections: () => clearAllSelections(),
    onClose: () => toggleControl(CONTROL_NAME),
    onRemoveTableSelectionRow: (selectionId) => removeTableSelectionRow(selectionId),
    onChangeAggregateFunction: (selectionId, aggregateFunction) => changeAggregateFunction(selectionId, aggregateFunction),
    onChangeSelectionName: (selectionId, selectionName) => changeSelectionName(selectionId, selectionName),
    onChangeTraceColor: (selectionId, color) => changeTraceColor(selectionId, color),
    onZoomToSelectionExtent: (extent, crs) => zoomToExtent(extent, crs),
    onZoomToSelectionPoint: (pos, zoom, crs) => zoomToPoint(pos, zoom, crs)
})(Panel);

export default compose(
    withProps(props => ({
        aggregationOptions: getDefaultAggregationOperations(),
        aggregateFunction: props.aggregateFunction
    })),
    localizedProps(["aggregationOptions", "aggregateFunction"])
)(TSPPanel);