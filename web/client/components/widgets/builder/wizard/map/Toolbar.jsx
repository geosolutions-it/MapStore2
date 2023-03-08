/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import isEmpty from 'lodash/isEmpty';

import Toolbar from '../../../../misc/toolbar/Toolbar';
import { is3DVisualizationMode } from '../../../../../utils/MapTypeUtils';

const getSaveTooltipId = (step, { id } = {}) => {
    if (id) {
        return "widgets.builder.wizard.updateWidget";
    }
    return "widgets.builder.wizard.addTheWidget";
};

export default ({ step = 0, buttons, tocButtons = [], stepButtons = [], dashBoardEditing = false, editorData = {}, setPage = () => { }, onFinish = () => { }, toggleLayerSelector = () => { }, onChange = () => {} } = {}) => {
    const map = (editorData?.maps || []).find(m => m.mapId === editorData?.selectedMapId) || {};
    const is3D = is3DVisualizationMode(map);
    const isEmptyMap = editorData?.widgetType === "map" && isEmpty(map);
    return (<Toolbar btnDefaultProps={{
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
        onClick: () => onChange(`maps[${editorData?.selectedMapId}].mapInfoControl`, !map?.mapInfoControl),
        visible: !is3D && !isEmptyMap && dashBoardEditing && editorData?.widgetType === "map",
        glyph: "info-sign",
        bsStyle: map?.mapInfoControl ? "success" : "primary",
        tooltipId: map?.mapInfoControl ? "widgets.builder.wizard.disableIdentifyTool" : "widgets.builder.wizard.enableIdentifyTool"
    },
    {
        onClick: () => toggleLayerSelector(true),
        visible: !isEmptyMap && step === 0,
        glyph: "plus",
        tooltipId: "widgets.builder.wizard.addLayer"
    }, {
        onClick: () => setPage(Math.min(step + 1, 2)),
        visible: !isEmptyMap && step === 0,
        glyph: "arrow-right",
        tooltipId: "widgets.builder.wizard.configureWidgetOptions"
    }, {
        onClick: () => onFinish(Math.min(step + 1, 1)),
        visible: step === 1,
        glyph: "floppy-disk",
        tooltipId: getSaveTooltipId(step, editorData)
    }]} />);
};
