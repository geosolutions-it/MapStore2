/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { isLoggedIn } from '../../selectors/security';
import { mapTypeSelector } from '../../selectors/maptype';

import Message from '../../components/I18N/Message';

class EmptyMaps extends React.Component {
    static propTypes = {
        loggedIn: PropTypes.bool,
        showCreateButton: PropTypes.bool,
        mapType: PropTypes.string
    }
    static contextTypes = {
        router: PropTypes.object
    };
    static defaultProps = {
        showCreateButton: true
    }

    render() {
        return (<div style={{ width: "100%", textAlign: "center", marginBottom: '20px' }}>{this.props.loggedIn && this.props.showCreateButton
            ? (<Button bsStyle="primary" onClick={() => { this.context.router.history.push("/viewer/" + this.props.mapType + "/new"); }}>
                <Message msgId="resources.maps.createNewOne" />
            </Button>)
            : null}</div>);
    }
}
export default connect(
    createSelector([isLoggedIn, mapTypeSelector], (loggedIn, mapType) => ({
        loggedIn: !!loggedIn,
        mapType
    })),
)(EmptyMaps);
