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
import {textSearchConfigSelector, bookmarkSearchConfigSelector} from '../../selectors/searchconfig';
import {currentContextSelector, contextResourceSelector} from '../../selectors/context';
import MapUtils from '../../utils/MapUtils';

const saveSelector = createSelector(
    userSelector,
    mapInfoLoadingSelector,
    mapSaveErrorsSelector,
    layersSelector,
    groupsSelector,
    backgroundListSelector,
    mapOptionsToSaveSelector,
    textSearchConfigSelector,
    bookmarkSearchConfigSelector,
    mapSelector,
    mapTypeSelector,
    currentContextSelector,
    contextResourceSelector,
    (user, loading, errors, layers, groups, backgrounds, additionalOptions, textSearchConfig, bookmarkSearchConfig, map, mapType, context, contextResource) =>
        ({ user, loading, errors, layers, groups, backgrounds, additionalOptions, textSearchConfig, bookmarkSearchConfig, map, mapType, context, contextResource })
);
const SaveBaseDialog = compose(
    connect(saveSelector, {
        saveMap: saveMapResource
    }),
    withProps({
        category: "MAP",
        enableDetails: true
    }),
    getContext({
        router: PropTypes.object
    }),
    withHandlers({
        onClose: ({onClose, onResetMapSaveError}) => () => {
            onClose();
            onResetMapSaveError(); // reset errors when closing the modal
        },
        onSave: ({map, layers, groups, backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions, saveMap, isNewResource, user, contextResource}) => resource => {
            const mapData = MapUtils.saveMapConfiguration(map, layers, groups,
                backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions);
            const owner = {"owner": user && user.name || null};
            const {metadata, data, attributes, id, ...others} = resource;
            let updates;
            if (!isNewResource) {
                updates = {data: mapData, attributes, metadata, id, ...others};
            } else {
                updates = {
                    data: mapData,
                    attributes: {
                        ...attributes,
                        context: contextResource?.id || attributes.context
                    },
                    metadata: {attributes: {...owner}, ...metadata},
                    ...others
                };
            }
            return saveMap(updates);
        }
    }),
    handleSaveModal
)(require('../../components/resources/modals/Save'));

export default SaveBaseDialog;


