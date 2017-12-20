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
module.exports = ({step = 0, editorData = {}, onFinish = () => {}} = {}) => (<Toolbar btnDefaultProps={{
        bsStyle: "primary",
        bsSize: "sm"
    }}
    buttons={[{
        onClick: () => onFinish(Math.min(step + 1, 1)),
        visible: true,
        glyph: "floppy-disk",
        tooltipId: getSaveTooltipId(step, editorData)
    }]} />);
