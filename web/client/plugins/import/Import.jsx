/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { compose, branch, renderComponent} = require('recompose');
const DragZone = require('../../components/import/ImportDragZone');

const StyleDialog = require('./StyleDialog');

module.exports = compose(
    branch(
        ({ hasData }) => !hasData,
        renderComponent(DragZone)
    )
)(StyleDialog);
