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

const {Button, Grid, Col} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
const {mapTypeSelector} = require('../selectors/maptype');


class CreateNewMap extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        onGoToMap: PropTypes.func,
        colProps: PropTypes.object,
        isLoggedIn: PropTypes.bool,
        allowedRoles: PropTypes.array,
        user: PropTypes.object
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        mapType: "leaflet",
        isLoggedIn: false,
        allowedRoles: ["ADMIN", "USER"],
        onGoToMap: () => {},
        colProps: {
            xs: 12,
            sm: 12,
            lg: 12,
            md: 12
        }
    };
    render() {
        const display = this.isAllowed() ? null : "none";
        return (<Grid fluid style={{marginBottom: "30px", padding: 0, display}}>
        <Col {...this.props.colProps} >
            <Button bsStyle="primary" onClick={() => { this.context.router.history.push("/viewer/" + this.props.mapType + "/new"); }}>
            <Message msgId="newMap" />
            </Button>
        </Col>
        </Grid>);
    }
    isAllowed = () => this.props.isLoggedIn && this.props.allowedRoles.indexOf(this.props.user && this.props.user.role) >= 0;
}

module.exports = {
    CreateNewMapPlugin: connect((state) => ({
        mapType: mapTypeSelector(state),
        isLoggedIn: state && state.security && state.security.user && state.security.user.enabled && !(state.browser && state.browser.mobile) && true || false,
        user: state && state.security && state.security.user
    }))(CreateNewMap)
};
