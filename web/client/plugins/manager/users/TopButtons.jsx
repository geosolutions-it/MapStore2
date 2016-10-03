/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {Button, Grid} = require('react-bootstrap');
const {editUser} = require('../../../actions/users');
const Message = require('../../../components/I18N/Message');

const Bar = React.createClass({
    propTypes: {
        onNewUser: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            onNewUser: () => {}
        };
    },
    render() {
        return (<Grid style={{marginBottom: "10px"}} fluid={true}><Button bsStyle="primary" onClick={this.props.onNewUser}><Message msgId="users.newUser" /></Button></Grid>);
    }
});
const TopButtons = connect(() => ({}), {onNewUser: editUser.bind(null, {role: "USER", "enabled": true})} )(Bar);

module.exports = TopButtons;
