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

import Message from '../../components/I18N/Message';

class EmptyContexts extends React.Component {
    static propTypes = {
        loggedIn: PropTypes.bool
    }
    static contextTypes = {
        router: PropTypes.object
    };

    render() {
        return (<div style={{width: "100%", textAlign: "center"}}>{this.props.loggedIn
            ? (<Button bsStyle="primary" onClick={() => { this.context.router.history.push("/context-creator/general-settings"); }}>
                <Message msgId="resources.contexts.createANewOne" />
            </Button>)
            : null}</div>);
    }
}

export default connect(
    createSelector(isLoggedIn, (loggedIn) => ({
        loggedIn: !!loggedIn
    })),
)(EmptyContexts);

