/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import { compose, lifecycle } from 'recompose';
import MapViewerCmp from '../components/viewer/MapViewerCmp';
import { loadContext } from '../../actions/context';
import MapViewerContainer from '../../containers/MapViewer';
import { createStructuredSelector } from 'reselect';
import { contextMonitoredStateSelector, currentContextSelector, pluginsSelector } from '../../selectors/context';

class Context extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
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

export default compose(
    connect(
        createStructuredSelector({
            pluginsConfig: pluginsSelector,
            mode: () => 'desktop',
            context: currentContextSelector,
            monitoredState: contextMonitoredStateSelector
        }),
        {
            loadContext
        }),
    lifecycle({
        componentWillMount() {
            const params = this.props.match.params;
            this.props.loadContext(params);
        },
        componentDidUpdate(oldProps) {
            const paramsChanged = !isEqual(this.props.match.params, oldProps.match.params);
            const newParams = this.props.match.params;

            if (paramsChanged) {
                this.props.loadContext(newParams);
            }
        }
    })
)(Context);
