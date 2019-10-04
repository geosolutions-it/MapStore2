/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');


const Toolbar = require('../../../../misc/toolbar/Toolbar');

const getBackTooltipId = step => {
    switch (step) {
    case 1:
        return "widgets.builder.wizard.backToTypeSelection";
    case 2:
        return "widgets.builder.wizard.backToChartOptions";
    default:
        return "back";

    }
};

const getNextTooltipId = step => {
    switch (step) {
    case 0:
        return "widgets.builder.wizard.configureChartOptions";
    case 1:
        return "widgets.builder.wizard.configureWidgetOptions";
    default:
        return "next";
    }
};

const getSaveTooltipId = (step, {id} = {}) => {
    if (id) {
        return "widgets.builder.wizard.updateWidget";
    }
    return "widgets.builder.wizard.addTheWidget";
};
module.exports = ({
    step = 0, editorData = {}, valid, setPage = () => {}, onFinish = () => {},
    stepButtons = [],
    openFilterEditor = () => {}
} = {}) => (<Toolbar btnDefaultProps={{
    bsStyle: "primary",
    bsSize: "sm"
}}
buttons={[{
    onClick: () => setPage(Math.max(0, step - 1)),
    visible: step > 0,
    glyph: "arrow-left",
    tooltipId: getBackTooltipId(step)
}, ...stepButtons, {
    visible: step > 0,
    onClick: openFilterEditor,
    glyph: "filter",
    tooltipId: "widgets.builder.setupFilter"
}, {
    onClick: () => setPage(Math.min(step + 1, 2)),
    visible: !!( step === 1 ),
    disabled: step === 1 && !valid,
    glyph: "arrow-right",
    tooltipId: getNextTooltipId(step)
}, {
    onClick: () => onFinish(Math.min(step + 1, 1)),
    visible: step === 2,
    glyph: "floppy-disk",
    tooltipId: getSaveTooltipId(step, editorData)
}]} />);
