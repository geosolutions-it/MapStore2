import React from 'react';
import {connect} from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { setLocation, setPov } from '../actions/streetView';
import Message from '../../../components/I18N/Message';

import GStreetView from '../components/GStreetView';
import { apiLoadedSelectorCreator, locationSelector, panoramaOptionsSelector } from '../selectors/streetView';
import { getAPI } from '../api/google';

const GStreetViewPanel = connect(createStructuredSelector({
    apiLoaded: apiLoadedSelectorCreator("google"),
    location: locationSelector,
    panoramaOptions: panoramaOptionsSelector
}), {
    setLocation,
    setPov
})(({apiLoaded, enabled, ...props}) => {
    if (apiLoaded) {
        return <GStreetView location={location} google={getAPI()} {...props} />;
    }
    return <div className="street-view-api-loader"><Message msgId="streetView.loadingAPI" /></div>;
});
export default GStreetViewPanel;
