/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Toolbar from '../../../../misc/toolbar/Toolbar';

const getSaveTooltipId = (step, { id } = {}) => {
    if (id) {
        return "widgets.builder.wizard.updateWidget";
    }
    return "widgets.builder.wizard.addTheWidget";
};

export default ({ step = 0, buttons, tocButtons = [], stepButtons = [], dashBoardEditing = false, editorData = {}, setPage = () => { }, onFinish = () => { }, toggleLayerSelector = () => { }, onChange = () => {} } = {}) => (<Toolbar btnDefaultProps={{
    bsStyle: "primary",
    bsSize: "sm"
}}
buttons={buttons || [...(step === 0 ? tocButtons : []), {
    onClick: () => setPage(Math.max(step - 1, 0)),
    visible: step === 1,
    glyph: "arrow-left",
    tooltipId: "widgets.builder.wizard.configureMapOptions"
},
...stepButtons,
{
    onClick: () => onChange("map.mapInfoControl", !editorData?.map?.mapInfoControl),
    visible: dashBoardEditing && editorData?.widgetType === "map",
    glyph: "info-sign",
    bsStyle: editorData?.map?.mapInfoControl ? "success" : "primary",
    tooltipId: editorData?.map?.mapInfoControl ? "widgets.builder.wizard.disableIdentifyTool" : "widgets.builder.wizard.enableIdentifyTool"
},
{
    onClick: () => toggleLayerSelector(true),
    visible: step === 0,
    glyph: "plus",
    tooltipId: "widgets.builder.wizard.addLayer"
}, {
    onClick: () => setPage(Math.min(step + 1, 2)),
    visible: step === 0,
    glyph: "arrow-right",
    tooltipId: "widgets.builder.wizard.configureWidgetOptions"
}, {
    onClick: () => onFinish(Math.min(step + 1, 1)),
    visible: step === 1,
    glyph: "floppy-disk",
    tooltipId: getSaveTooltipId(step, editorData)
}]} />);
