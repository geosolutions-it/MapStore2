/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const { Button } = require('react-bootstrap');
const { isLoggedIn } = require('../../selectors/security');

const Message = require('../../components/I18N/Message');

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
module.exports = connect(
    createSelector(isLoggedIn, (loggedIn) => ({
        loggedIn: !!loggedIn
    })),
)(EmptyDashboards);
