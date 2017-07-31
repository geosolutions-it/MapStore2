/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const Message = require('../../I18N/Message');
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
            ? (<div style={nodataStyle}><Message msgId="loading" /></div>) :
            <div style={nodataStyle}><Message msgId="featuregrid.noFeaturesAvailable" /></div>;
    }
}

module.exports = EmptyRowsView;
