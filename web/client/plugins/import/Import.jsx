/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, branch, mapPropsStream, renderComponent, renderNothing } from 'recompose';

import { createStructuredSelector } from 'reselect';
import DragZone from '../../components/import/ImportDragZone';
import { connect } from 'react-redux';
import StyleDialog from './StyleDialog';
import { configureMap } from '../../actions/config';
import { mapSelector } from '../../selectors/map';

export default compose(
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
