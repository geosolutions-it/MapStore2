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
        return "widgets.builder.wizard.backToPreview";
    case 2:
        return "widgets.builder.wizard.backToChartOptions";
    default:
        return "back";

    }
};
const getNextTooltipId = (step, valid) => !valid
    ? undefined
    : "widgets.builder.wizard.configureWidgetOptions";

const isValidStep1 = ({mapSync}) => mapSync;
const getSaveTooltipId = (step, {id} = {}) => {
    if (id) {
        return "widgets.builder.wizard.updateWidget";
    }
    return "widgets.builder.wizard.addTheWidget";
};

module.exports = ({ step = 0, editorData = {}, valid, stepButtons = [], onFinish = () => { }, setPage = () => { }} = {}) => (<Toolbar btnDefaultProps={{
    bsStyle: "primary",
    bsSize: "sm"
}}
buttons={[{
    onClick: () => setPage(Math.max(0, step - 1)),
    visible: step > 0,
    glyph: "arrow-left",
    tooltipId: getBackTooltipId(step)
}, ...stepButtons, {
    onClick: () => setPage(Math.min(step + 1, 1)),
    visible: step === 0,
    disabled: step === 0 && !isValidStep1(editorData) || !valid,
    glyph: "arrow-right",
    tooltipId: getNextTooltipId(step, valid)
}, {
    onClick: () => onFinish(Math.min(step + 1, 1)),
    visible: step === 1,
    glyph: "floppy-disk",
    tooltipId: getSaveTooltipId(step, editorData)
}]} />);
