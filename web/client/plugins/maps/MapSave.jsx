/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import PropTypes from 'prop-types';
import {compose, withProps, withHandlers, getContext} from 'recompose';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {saveMapResource} from '../../actions/maps';
import {mapSelector, mapInfoLoadingSelector, mapSaveErrorsSelector} from '../../selectors/map';
import {layersSelector, groupsSelector} from '../../selectors/layers';
import {backgroundListSelector} from '../../selectors/backgroundselector';
import {mapOptionsToSaveSelector} from '../../selectors/mapsave';
import handleSaveModal from '../../components/resources/modals/enhancers/handleSaveModal';
import { userSelector } from '../../selectors/security';
import {mapTypeSelector} from '../../selectors/maptype';
import {currentContextSelector} from '../../selectors/context';
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
        onClose: ({onClose, onMapSaveError}) => () => {
            onClose();
            onMapSaveError(); // reset errors when closing the modal
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


