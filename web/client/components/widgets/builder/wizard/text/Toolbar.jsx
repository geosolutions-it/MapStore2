/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');


const Toolbar = require('../../../../misc/toolbar/Toolbar');

const getSaveTooltipId = (step, {id} = {}) => {
    if (id) {
        return "widgets.builder.wizard.updateWidget";
    }
    return "widgets.builder.wizard.addToTheMap";
};
const getNextTooltipId = () => {
    return "widgets.builder.wizard.configureWidgetOptions";
};
const getBackTooltipId = () => "back"; // TODO I18N
module.exports = ({step = 0, editorData = {}, onFinish = () => {}, setPage = () => {}} = {}) => (<Toolbar btnDefaultProps={{
        bsStyle: "primary",
        bsSize: "sm"
    }}
    buttons={[{
        onClick: () => setPage(Math.max(0, step - 1)),
        visible: step > 0,
        glyph: "arrow-left",
        tooltipId: getBackTooltipId(step)
    }, {
        onClick: () => setPage(Math.min(step + 1, 2)),
        visible: step === 0,
        glyph: "arrow-right",
        tooltipId: getNextTooltipId(step)
    }, {
        onClick: () => onFinish(Math.min(step + 1, 1)),
        visible: step === 1,
        glyph: "floppy-disk",
        tooltipId: getSaveTooltipId(step, editorData)
    }]} />);
