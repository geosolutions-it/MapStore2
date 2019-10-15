/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import MapViewerCmp from '../components/viewer/MapViewerCmp';
import {loadMapConfig} from '../../actions/config';
import {initMap} from '../../actions/map';
import MapViewerContainer from '../../containers/MapViewer';
import { createStructuredSelector } from 'reselect';
import { contextMonitoredStateSelector, currentContextSelector } from '../../selectors/context';

class Context extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadMapConfig: PropTypes.func,
        onInit: PropTypes.func,
        plugins: PropTypes.object,
        wrappedContainer: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        location: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        plugins: {},
        match: {
            params: {}
        },
        wrappedContainer: MapViewerContainer
    };

    render() {
        return (<MapViewerCmp {...this.props} />);
    }
}

export default connect(createStructuredSelector({
    context: currentContextSelector,
    monitoredState: contextMonitoredStateSelector
}))(Context);
