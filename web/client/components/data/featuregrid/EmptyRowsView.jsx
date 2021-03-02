/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Message from '../../I18N/Message';
const nodataStyle = {
    width: "100%",
    height: "100%",
    textAlign: "center",
    verticalAlign: "center"
};

const emptyRowsStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};
class EmptyRowsView extends React.PureComponent {
    static propTypes = {
        loading: PropTypes.bool
    }
    render() {
        return this.props.loading
            ? (<div style={nodataStyle}><Message msgId="loading" /></div>) :
            <div style={emptyRowsStyle}>
                <Glyphicon glyph="list-alt"/>&nbsp;<Message msgId="featuregrid.noFeaturesAvailable" />
            </div>;
    }
}

export default EmptyRowsView;
