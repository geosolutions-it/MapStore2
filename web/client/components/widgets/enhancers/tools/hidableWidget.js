/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withProps} = require('recompose');

/**
 * Support widget hiding. Add the hide button to the widget menu.
 */
module.exports = () =>
compose(
    withProps(({ widgetTools = [], toolsOptions = {}, canEdit, updateProperty = () => { }, hide= false}) => ({
        widgetTools: !!toolsOptions.showHide
            ? [
            ...widgetTools,
            {
                glyph: "lock",
                target: "menu",
                active: hide,
                textId: hide ? "widgets.widget.menu.unhide" : "widgets.widget.menu.hide",
                tooltipId: hide ? "widgets.widget.menu.unhideDescription" : "widgets.widget.menu.hideDescription",
                visible: canEdit,
                onClick: () => updateProperty("hide", !hide)
            }
        ] : widgetTools}
    ))
);
