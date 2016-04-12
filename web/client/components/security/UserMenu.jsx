/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
 /**
  * Copyright 2016, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const React = require('react');
const {DropdownButton, MenuItem, Glyphicon} = require('react-bootstrap');


  /**
   * A DropDown menu for user details:
   */
const UserMenu = React.createClass({
  propTypes: {
      // PROPS
      user: React.PropTypes.object,
      displayName: React.PropTypes.string,
      /**
       * displayAttributes function to filter attributes to show
       */
      displayAttributes: React.PropTypes.func,

      // CALLBACKS
      onShowAccountInfo: React.PropTypes.func,
      onShowChangePassword: React.PropTypes.func,
      onShowLogin: React.PropTypes.func,
      onLogout: React.PropTypes.func
  },
  getDefaultProps() {
      return {
          user: {
          },
          onLogout: () => {},
          onPasswordChange: () => {},
          displayName: "name",
          displayAttributes: (attr) => {
              return attr.name === "email";
          }
      };
  },
  renderGuestTools(username) {
      return (<DropdownButton key="loginButton" pullRight bsStyle="primary" title={username} key="user-menu" id="dropdown-basic-primary">
          <MenuItem key="login" onClick={this.props.onShowLogin}><Glyphicon glyph="log-out" /> Login</MenuItem>
      </DropdownButton>);
  },
  renderLoggedTools(username) {
      return (
      <DropdownButton key="loginButton" pullRight bsStyle="primary" title={username} >
          <MenuItem key="accountInfo" onClick={this.props.onShowAccountInfo}> <Glyphicon glyph="user" /> Account Info</MenuItem>
          <MenuItem key="passwordChange" onClick={this.props.onShowChangePassword}> <Glyphicon glyph="asterisk" /> Change Password</MenuItem>
          <MenuItem key="divider" divider />
          <MenuItem key="logout" onClick={this.props.onLogout}><Glyphicon glyph="log-out" /> Logout</MenuItem>
      </DropdownButton>);
  },
  render() {
      let username = (<span><Glyphicon glyph="user" /> {this.props.user && this.props.user[this.props.displayName] || "Guest"}</span>);
      return (
          <div>
            {this.props.user && this.props.user[this.props.displayName] ? this.renderLoggedTools(username) : this.renderGuestTools(username)}
        </div>
      );
  }
});

module.exports = UserMenu;
