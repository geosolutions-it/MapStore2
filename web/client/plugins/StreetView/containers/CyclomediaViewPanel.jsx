import React, {useMemo} from 'react';
import {createStructuredSelector, createSelector} from 'reselect';
import {connect} from 'react-redux';
import {PROVIDERS, CYCLOMEDIA_DEFAULT_MAX_RESOLUTION} from '../constants';
import { getAPI } from '../api/cyclomedia';
import {setLocation, setPov, updateStreetViewLayer} from '../actions/streetView';
import {apiLoadedSelectorCreator, streetViewAPIKeySelector, locationSelector} from '../selectors/streetView';
import CyclomediaView from '../components/CyclomediaView/CyclomediaView';
import { currentResolutionSelector } from '../../../selectors/map';


const mapPointVisibleSelector = createSelector(
    currentResolutionSelector,
    (resolution) => {
        return resolution < CYCLOMEDIA_DEFAULT_MAX_RESOLUTION;
    }
);

const CyclomediaViewPanel = connect(createStructuredSelector({
    apiLoaded: apiLoadedSelectorCreator(PROVIDERS.CYCLOMEDIA),
    location: locationSelector,
    apiKey: streetViewAPIKeySelector,
    mapPointVisible: mapPointVisibleSelector
}), {
    setLocation,
    setPov,
    refreshLayer: () => updateStreetViewLayer({_v_: Date.now()})
})(({enabled, apiLoaded, ...props}) => {
    const api = useMemo(() => getAPI(), [apiLoaded]);
    if (enabled) {
        return <CyclomediaView api={api} {...props} />;
    }
    return null;
});

export default CyclomediaViewPanel;
