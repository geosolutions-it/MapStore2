/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { isLoggedIn } from '../../selectors/security';
import Message from '../../components/I18N/Message';
import Button from '../../components/misc/Button';

class EmptyDashboards extends React.Component {
    static propTypes = {
        loggedIn: PropTypes.bool,
        showCreateButton: PropTypes.bool
    }
    static contextTypes = {
        router: PropTypes.object
    };
    static defaultProps = {
        showCreateButton: true
    }

    render() {
        return (<div style={{width: "100%", textAlign: "center"}}>{this.props.loggedIn && this.props.showCreateButton
            ? (<Button bsStyle="primary" onClick={() => { this.context.router.history.push("/dashboard"); }}>
                <Message msgId="resources.dashboards.createANewOne" />
            </Button>)
            : null}</div>);
    }
}

export default connect(
    createSelector(isLoggedIn, (loggedIn) => ({
        loggedIn: !!loggedIn
    }))
)(EmptyDashboards);
