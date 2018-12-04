/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withProps} = require('recompose');

/**
 * Support widget locking. When locked, a widget becomes "static".
 */
module.exports = () =>
compose(
    withProps(({ widgetTools = [], toolsOptions = {}, updateProperty = () => { }, canEdit, dataGrid = {}}) => ({
        widgetTools: [
            ...widgetTools,
            {
                glyph: "lock",
                visible: !!toolsOptions.showLock,
                style: {
                    paddingLeft: 4,
                    paddingRight: 4,
                    color: !dataGrid.static ? "grey" : undefined,
                    opacity: !dataGrid.static ? 0.5 : 1
                },
                onClick: () => updateProperty("dataGrid.static", !dataGrid.static)
            }
            ],
        // locked tools can not be edited
        canEdit: canEdit && !dataGrid.static
    }))
);
