/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withProps} = require('recompose');
module.exports = () =>
    withProps(({ widgetTools = [], canEdit, onEdit = () => {}, toggleDeleteConfirm = () => {} }) => ({
    widgetTools: canEdit
            ? [
                ...widgetTools,
                {
                    glyph: "pencil",
                    target: "menu",
                    textId: "widgets.widget.menu.edit",
                    onClick: () => onEdit()
                }, {
                    glyph: "trash",
                    target: "menu",
                    textId: "widgets.widget.menu.delete",
                    onClick: () => toggleDeleteConfirm(true)
                }
            ]
        : widgetTools
}));
