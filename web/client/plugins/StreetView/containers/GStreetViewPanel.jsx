import React from 'react';
import {connect} from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { setLocation, setPov } from '../actions/streetView';

import GStreetView from '../components/GStreetView';
import { apiLoadedSelector, locationSelector, panoramaOptionsSelector } from '../selectors/streetView';
import { getAPI } from '../api/gMaps';

const GStreetViewPanel = connect(createStructuredSelector({
    apiLoaded: apiLoadedSelector,
    location: locationSelector,
    panoramaOptions: panoramaOptionsSelector
}), {
    setLocation,
    setPov
})(({apiLoaded, enabled, ...props}) => {
    if (apiLoaded) {
        return <GStreetView location={location} google={getAPI()} {...props} />;
    }
    return null;
});
export default GStreetViewPanel;
