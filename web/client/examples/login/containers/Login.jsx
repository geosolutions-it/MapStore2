/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Debug = require('../../../components/development/Debug');
const Localized = require('../../../components/I18N/Localized');
const {connect} = require('react-redux');
const {LoginPlugin} = require('../../../plugins/Login');
const {Jumbotron} = require('react-bootstrap');

const Login = React.createClass({
    propTypes: {
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        userDetails: React.PropTypes.object,
        enabled: React.PropTypes.bool
    },
    renderGroups() {
        if (!this.props.userDetails || !this.props.userDetails.user) {
            return null;
        }
        let groups = this.props.userDetails.user.groups.group.length ? this.props.userDetails.user.groups.group : [this.props.userDetails.user.groups.group];
        return (<div> your groups: <ul>
            {groups.map((group) => {return <li>{group.groupName}</li>; })}
        </ul></div>);
    },
    render() {
        return (<Localized messages={this.props.messages} locale={this.props.locale}>
            <div className="fill">
                <LoginPlugin />
                    <Jumbotron className="fill">
                    <h1>Hello, {this.props.userDetails && this.props.userDetails.user && this.props.userDetails.user.name || "Guest user. Please login"}</h1>
                    <p>This is a sample of the login functionality. In the future you will able to login to MapStore to create maps or admin a server.</p>
                    <p>{this.renderGroups()}</p>
                  </Jumbotron>
                <Debug/>
            </div>
        </Localized>);
    }

});
module.exports = connect((state) => {
    return {
        locale: state.locale && state.locale.locale,
        messages: state.locale && state.locale.messages || {},
        userDetails: state.userDetails
    };
})(Login);
