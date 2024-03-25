/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {connect} from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { setLocation, setPov } from '../actions/streetView';
import Message from '../../../components/I18N/Message';

import MapillaryView from '../components/MapillaryView/MapillaryView';
import { apiLoadedSelectorCreator, locationSelector, panoramaOptionsSelector } from '../selectors/streetView';
import { getAPI } from '../api/mapillary';

const MapillaryViewPanel = connect(createStructuredSelector({
    apiLoaded: apiLoadedSelectorCreator("mapillary"),
    location: locationSelector,
    panoramaOptions: panoramaOptionsSelector
}), {
    setLocation,
    setPov
})(({apiLoaded, enabled, ...props}) => {
    if (apiLoaded) {
        return <MapillaryView location={location} mapillary={getAPI()} {...props} />;
    }
    return <div className="street-view-api-loader"><Message msgId="streetView.loadingAPI" /></div>;
});
export default MapillaryViewPanel;
