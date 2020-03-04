/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { compose, branch, mapPropsStream, renderComponent, renderNothing } = require('recompose');
const { createStructuredSelector } = require('reselect');
const DragZone = require('../../components/import/ImportDragZone');
const { connect } = require('react-redux');
const StyleDialog = require('./StyleDialog');
const { configureMap } = require('../../actions/config');
const { mapSelector } = require('../../selectors/map');

module.exports = compose(
    mapPropsStream(
        props$ => props$.merge(
            props$
                .filter(({ layers }) => layers && layers.length > 0)
                .exhaustMap(() =>
                    props$.filter(({ layers }) => !layers || layers.length === 0)
                        .take(1)
                        .do(({ onClose = () => { } }) => onClose && onClose()).ignoreElements()
                )
        )),
    branch(
        ({ enabled }) => !enabled,
        renderNothing
    ),
    branch(
        ({ layers }) => !layers || layers.length === 0,
        compose(
            connect(createStructuredSelector({
                currentMap: mapSelector
            }), {
                loadMap: configureMap
            }),
            renderComponent(DragZone)
        )
    )
)(StyleDialog);
