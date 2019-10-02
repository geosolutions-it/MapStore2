/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withProps} = require('recompose');

/**
 * Add the edit/delete items to the menu. @see withMenu
 */
module.exports = () =>
    withProps(({ widgetTools = [], dataGrid = {}, canEdit, onEdit = () => {}, toggleDeleteConfirm = () => {} }) => ({
        widgetTools: canEdit
            ? [
                ...widgetTools,
                {
                    glyph: "pencil",
                    target: "menu",
                    visible: canEdit && !dataGrid.static, // unpin to edit. TODO: configurable pinned to be editable
                    textId: "widgets.widget.menu.edit",
                    onClick: () => onEdit()
                }, {
                    glyph: "trash",
                    target: "menu",
                    visible: canEdit && !dataGrid.static,
                    textId: "widgets.widget.menu.delete",
                    onClick: () => toggleDeleteConfirm(true)
                }
            ]
            : widgetTools
    }));
