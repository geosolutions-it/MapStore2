/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');

const {ButtonToolbar, Button, Grid, Col} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
const {mapTypeSelector} = require('../selectors/maptype');


class CreateNewMap extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        dashboardsAvailable: PropTypes.bool,
        colProps: PropTypes.object,
        isLoggedIn: PropTypes.bool,
        allowedRoles: PropTypes.array,
        user: PropTypes.object,
        fluid: PropTypes.bool
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        mapType: "leaflet",
        dashboardsAvailable: false,
        isLoggedIn: false,
        allowedRoles: ["ADMIN", "USER"],
        colProps: {
            xs: 12,
            sm: 12,
            lg: 12,
            md: 12
        },
        fluid: false
    };
    render() {
        const display = this.isAllowed() ? null : "none";
        return (<Grid fluid={this.props.fluid} style={{marginBottom: "30px", padding: 0, display}}>
        <Col {...this.props.colProps} >
            <ButtonToolbar>
            <Button bsStyle="primary" onClick={() => { this.context.router.history.push("/viewer/" + this.props.mapType + "/new"); }}>
                <Message msgId="newMap" />
            </Button>
            {this.props.dashboardsAvailable ?
                <Button bsStyle="primary" onClick={() => { this.context.router.history.push("/dashboard/"); }}>
                    <Message msgId="resources.dashboards.newDashboard" />
                </Button>
                : null}
            </ButtonToolbar>
        </Col>
        </Grid>);
    }
    isAllowed = () => this.props.isLoggedIn && this.props.allowedRoles.indexOf(this.props.user && this.props.user.role) >= 0;
}
const {areDashboardsAvailable} = require('../selectors/dashboards');
module.exports = {
    CreateNewMapPlugin: connect((state) => ({
        dashboardsAvailable: areDashboardsAvailable,
        mapType: mapTypeSelector(state),
        isLoggedIn: state && state.security && state.security.user && state.security.user.enabled && !(state.browser && state.browser.mobile) && true || false,
        user: state && state.security && state.security.user
    }))(CreateNewMap)
};
