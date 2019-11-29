/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose, getContext, withHandlers, withProps} from 'recompose';
import {createSelector} from 'reselect';

import {saveMapResource} from '../../actions/maps';
import handleSaveModal from '../../components/resources/modals/enhancers/handleSaveModal';
import {backgroundListSelector} from '../../selectors/backgroundselector';
import {currentContextSelector} from '../../selectors/context';
import {groupsSelector, layersSelector} from '../../selectors/layers';
import {mapInfoLoadingSelector, mapSaveErrorsSelector, mapSelector} from '../../selectors/map';
import {mapOptionsToSaveSelector} from '../../selectors/mapsave';
import {mapTypeSelector} from '../../selectors/maptype';
import { userSelector } from '../../selectors/security';
import MapUtils from '../../utils/MapUtils';

const textSearchConfigSelector = state => state.searchconfig && state.searchconfig.textSearchConfig;

const saveSelector = createSelector(
    userSelector,
    mapInfoLoadingSelector,
    mapSaveErrorsSelector,
    layersSelector,
    groupsSelector,
    backgroundListSelector,
    mapOptionsToSaveSelector,
    textSearchConfigSelector,
    mapSelector,
    mapTypeSelector,
    currentContextSelector,
    (user, loading, errors, layers, groups, backgrounds, additionalOptions, textSearchConfig, map, mapType, context) =>
        ({ user, loading, errors, layers, groups, backgrounds, additionalOptions, textSearchConfig, map, mapType, context })
);
const SaveBaseDialog = compose(
    connect(saveSelector, {
        saveMap: saveMapResource
    }),
    withProps({
        category: "MAP"
    }),
    getContext({
        router: PropTypes.object
    }),
    withHandlers({
        onClose: ({onClose, clearErrors}) => () => {
            onClose();
            clearErrors(); // reset errors when closing the modal
        },
        onSave: ({map, layers, groups, backgrounds, textSearchConfig, additionalOptions, saveMap, isMapSaveAs, user}) => resource => {
            const mapData = MapUtils.saveMapConfiguration(map, layers, groups,
                backgrounds, textSearchConfig, additionalOptions);
            const attributes = {"owner": user && user.name || null};
            const {metadata, data, id, ...others} = resource;
            let updates;
            if (!isMapSaveAs) {
                updates = {data: mapData, metadata, id, ...others};
            } else {
                updates = {data: mapData, metadata: {attributes, ...metadata}, ...others};
            }
            return saveMap(updates);
        }
    }),
    handleSaveModal
)(require('../../components/resources/modals/Save'));

export default SaveBaseDialog;


