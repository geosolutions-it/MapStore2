/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { compose, branch, renderComponent, renderNothing } = require('recompose');
const DragZone = require('../../components/import/ImportDragZone');
const { connect } = require('react-redux');
const StyleDialog = require('./StyleDialog');
const { configureMap} = require('../../actions/config');

module.exports = compose(
    branch(
        ({ enabled }) => !enabled,
        renderNothing
    ),
    branch(
        ({ layers }) => !layers || layers.length === 0,
        compose(
            connect(() => ({}), {
                loadMap: configureMap
            }),
            renderComponent(DragZone)
        )

    )
)(StyleDialog);
