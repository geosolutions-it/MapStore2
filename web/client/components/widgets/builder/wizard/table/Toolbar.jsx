/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');


const Toolbar = require('../../../../misc/toolbar/Toolbar');
const isValidStep1 = editorData => editorData && editorData.options && editorData.options.propertyName && editorData.options.propertyName.length !== 0;

const getBackTooltipId = step => {
    switch (step) {
    case 1:
        return "widgets.builder.wizard.backToTableOptions";
    case 2:
        return "widgets.builder.wizard.backToChartOptions";
    default:
        return "back";

    }
};

const getNextTooltipId = (step, valid) => valid ? "widgets.builder.wizard.configureWidgetOptions" : "widgets.builder.errors.checkAtLeastOneAttribute";

const getSaveTooltipId = (step, {id} = {}) => {
    if (id) {
        return "widgets.builder.wizard.updateWidget";
    }
    return "widgets.builder.wizard.addTheWidget";
};
module.exports = ({ openFilterEditor = () => { }, step = 0, stepButtons = [], editorData = {}, setPage = () => {}, onFinish = () => {}} = {}) => (<Toolbar btnDefaultProps={{
    bsStyle: "primary",
    bsSize: "sm"
}}
buttons={[{
    onClick: () => setPage(Math.max(0, step - 1)),
    visible: step > 0,
    glyph: "arrow-left",
    tooltipId: getBackTooltipId(step)
}, ...stepButtons, {
    visible: step >= 0,
    onClick: openFilterEditor,
    /* if no valid attribute is present, filter must be disabled
         * (Query panel don't work you can not proceed, so it doesn't make sense to
         * create a filter if you can not create the widget)
         * TODO: improve checking valid attributes presence instead
         * of valid flag.
         */
    disabled: !isValidStep1(editorData),
    glyph: "filter",
    tooltipId: "widgets.builder.setupFilter"
}, {
    onClick: () => setPage(Math.min(step + 1, 2)),
    visible: step === 0,
    disabled: step === 0 && !isValidStep1(editorData),
    glyph: "arrow-right",
    tooltipId: getNextTooltipId(step, isValidStep1(editorData))
}, {
    onClick: () => onFinish(Math.min(step + 1, 1)),
    visible: step === 1,
    glyph: "floppy-disk",
    tooltipId: getSaveTooltipId(step, editorData)
}]} />);
