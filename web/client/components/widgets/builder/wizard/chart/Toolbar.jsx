/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import Toolbar from '../../../../misc/toolbar/Toolbar';

const getBackTooltipId = step => {
    if (step === 1) {
        return "widgets.builder.wizard.backToChartOptions";
    }
    return "back";
};

const getNextTooltipId = (step, isInvalid) => {
    if (isInvalid) {
        return "widgets.builder.wizard.errorChart";
    }
    if (step === 0) {
        return "widgets.builder.wizard.configureWidgetOptions";
    }
    return "next";
};

const getSaveTooltipId = (step, {id} = {}) => {
    if (id) {
        return "widgets.builder.wizard.updateWidget";
    }
    return "widgets.builder.wizard.addTheWidget";
};

const onDelete = (editorData, onChange) => {
    const charts = editorData?.charts?.filter(c => c.chartId !== editorData?.selectedChartId);
    onChange('chart-delete', charts.length ? charts : undefined);
};

export default ({
    step = 0, editorData = {}, valid, setPage = () => {}, onFinish = () => {}, onChange = () => {},
    stepButtons = [],
    openFilterEditor = () => {},
    toggleLayerSelector = () => {},
    errors,
    noAttributes = false,
    dashBoardEditing = false
} = {}) => {
    const disable = !valid || (editorData?.mapSync && Object.values(errors).some(error => error));
    return (
        <Toolbar btnDefaultProps={{
            bsStyle: "primary",
            bsSize: "sm"
        }}
        buttons={[{
            onClick: () => setPage(Math.max(0, step - 1)),
            visible: step > 0,
            glyph: "arrow-left",
            tooltipId: getBackTooltipId(step)
        }, ...stepButtons, {
            onClick: openFilterEditor,
            disabled: noAttributes,
            glyph: "filter",
            tooltipId: "widgets.builder.setupFilter"
        }, {
            onClick: () => toggleLayerSelector(true),
            visible: dashBoardEditing && step === 0,
            glyph: "plus",
            tooltipId: "widgets.builder.addNewLayers"
        }, {
            onClick: () => onDelete(editorData, onChange),
            visible: dashBoardEditing && step === 0,
            glyph: "trash",
            tooltipId: "widgets.builder.deleteChart"
        }, {
            onClick: () => setPage(Math.min(step + 1, 1)),
            visible: step === 0,
            disabled: step === 0 && disable,
            glyph: "arrow-right",
            tooltipId: getNextTooltipId(step, disable)
        }, {
            onClick: () => onFinish(Math.min(step - 1, 1)),
            visible: step === 1,
            glyph: "floppy-disk",
            tooltipId: getSaveTooltipId(step, editorData)
        }]} />
    );
};
