import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { setLocation, setPov } from '../actions/streetView';

import { locationSelector } from '../selectors/streetView';
import PanoramaxView from '../components/PanoramaxView/PanoramaxView';

const PanoramaxViewPanel = connect(createStructuredSelector({
    location: locationSelector
}), {
    setLocation,
    setPov
})((props) => {
    return <PanoramaxView {...props} />;
});

export default PanoramaxViewPanel;
