/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {withHandlers, compose, defaultProps} from 'recompose';
import {pickBy} from 'lodash';
import {connect} from 'react-redux';
import {resizeMap} from '../../../actions/map';

import WithConfirm from '../../../components/misc/withConfirm';
import Message from '../../../components/I18N/Message';
import withResizeSpy from '../../../components/misc/enhancers/withResizeSpy';

import {createSelector} from 'reselect';
import {mapSelector} from '../../../selectors/map';
import {layersSelector, groupsSelector} from '../../../selectors/layers';
import {backgroundListSelector} from '../../../selectors/backgroundselector';
import {mapOptionsToSaveSelector} from '../../../selectors/mapsave';
import {textSearchConfigSelector, bookmarkSearchConfigSelector} from '../../../selectors/searchconfig';
import MapUtils from '../../../utils/MapUtils';
import { isNull } from 'util';


const saveSelector = createSelector(
    layersSelector,
    groupsSelector,
    backgroundListSelector,
    mapOptionsToSaveSelector,
    textSearchConfigSelector,
    bookmarkSearchConfigSelector,
    mapSelector,
    (layers, groups, backgrounds, additionalOptions, textSearchConfig, bookmarkSearchConfig, map) =>
        ({layers, groups, backgrounds, additionalOptions, textSearchConfig, bookmarkSearchConfig, map})
);


export default compose(
    connect(saveSelector),
    defaultProps({
        confirmTitle: <Message msgId = "mapEditor.confirmExitTitle"/>,
        confirmContent: <Message msgId = "mapEditor.confirmExitContent"/>
    }),
    withHandlers({
        onClick: ({hide, owner}) => () => {
            hide(owner);
        },
        save: ({save, owner, map, layers, groups, backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions}) => () => {
            const mapData = MapUtils.saveMapConfiguration(map, layers, groups,
                backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions);

            return save({...mapData.map, layers: mapData.map.layers.map(l => pickBy(l, (p) => p !== undefined && !isNull(p)))}, owner);
        }
    }),
    WithConfirm,
    withHandlers({hide: ({onClick}) => (...args) => onClick(...args) })
);

export const withResizeMap = compose(
    connect(null, {onResize: resizeMap}),
    withResizeSpy({debounceTime: 150})
);
