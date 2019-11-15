/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import PropTypes from 'prop-types';
import {compose, withProps, withHandlers, getContext, lifecycle} from 'recompose';
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
    (user, loading, errors, layers, groups, backgrounds, additionalOptions, textSearchConfig, map, mapType) =>
        ({ user, loading, errors, layers, groups, backgrounds, additionalOptions, textSearchConfig, map, mapType })
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
    lifecycle({
        componentDidUpdate(prevProps) {
            if (this.props.isMapSaveAs && this.props.map && this.props.map.mapId && prevProps.map && this.props.map.mapId !== prevProps.map.mapId) {
                this.props.router.history.push("/viewer/" + this.props.mapType + "/" + this.props.map.mapId);
            }
        }
    }),
    withHandlers({
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


