/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Message from '../../I18N/Message';

const nodataStyle = {
    width: "100%",
    height: "100%",
    textAlign: "center",
    verticalAlign: "center"
};

class EmptyRowsView extends React.PureComponent {
    static propTypes = {
        loading: PropTypes.bool
    }
    render() {
        return this.props.loading
            ? (<div style={nodataStyle}><Message msgId="loading" /></div>) : (this.props.children ? this.props.children : <div style={nodataStyle}><Message msgId="featuregrid.noFeaturesAvailable" /></div>);
    }
}

export default EmptyRowsView;
