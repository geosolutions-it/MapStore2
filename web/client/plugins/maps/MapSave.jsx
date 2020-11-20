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
import Save from '../../components/resources/modals/Save';
import {backgroundListSelector} from '../../selectors/backgroundselector';
import {contextResourceSelector, currentContextSelector} from '../../selectors/context';
import {groupsSelector, layersSelector} from '../../selectors/layers';
import {mapInfoLoadingSelector, mapSaveErrorsSelector, mapSelector} from '../../selectors/map';
import {mapOptionsToSaveSelector} from '../../selectors/mapsave';
import {mapTypeSelector} from '../../selectors/maptype';
import {bookmarkSearchConfigSelector, textSearchConfigSelector} from '../../selectors/searchconfig';
import { userSelector } from '../../selectors/security';
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
        onSave: ({map, layers, groups, backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions, saveMap, isNewResource, contextResource}) => resource => {
            const mapData = MapUtils.saveMapConfiguration(map, layers, groups,
                backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions);
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
                    metadata: {attributes: null, ...metadata},
                    ...others
                };
            }
            return saveMap(updates);
        }
    }),
    handleSaveModal
)(Save);

export default SaveBaseDialog;


