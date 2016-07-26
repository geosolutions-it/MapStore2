/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {DropdownButton, MenuItem, NavDropdown, Glyphicon} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');

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
      bsStyle: React.PropTypes.string,
      renderButtonText: React.PropTypes.bool,
      nav: React.PropTypes.bool,
      menuProps: React.PropTypes.object,

      // FUNCTIONS
      renderButtonContent: React.PropTypes.func,
      // CALLBACKS
      onShowAccountInfo: React.PropTypes.func,
      onShowChangePassword: React.PropTypes.func,
      onShowLogin: React.PropTypes.func,
      onLogout: React.PropTypes.func,
      className: React.PropTypes.string
  },
  getDefaultProps() {
      return {
          user: {
          },
          onLogout: () => {},
          onPasswordChange: () => {},
          displayName: "name",
          bsStyle: "primary",
          displayAttributes: (attr) => {
              return attr.name === "email";
          },
          className: "user-menu"
      };
  },
  renderGuestTools() {
      let DropDown = this.props.nav ? NavDropdown : DropdownButton;
      return (<DropDown id="loginButton" className={this.props.className} pullRight bsStyle={this.props.bsStyle} title={this.renderButtonText()} id="dropdown-basic-primary" {...this.props.menuProps}>
          <MenuItem onClick={this.props.onShowLogin}><Glyphicon glyph="log-in" /><Message msgId="user.login"/></MenuItem>
      </DropDown>);
  },
  renderLoggedTools() {
      let DropDown = this.props.nav ? NavDropdown : DropdownButton;
      return (
      <DropDown id="loginButton" className={this.props.className} pullRight bsStyle="success" title={this.renderButtonText()} {...this.props.menuProps} >
          <span key="logged-user"><MenuItem header>{this.props.user.name}</MenuItem></span>
          <MenuItem key="accountInfo" onClick={this.props.onShowAccountInfo}> <Glyphicon glyph="user" /><Message msgId="user.info"/></MenuItem>
          <MenuItem key="passwordChange" onClick={this.props.onShowChangePassword}> <Glyphicon glyph="asterisk" /> <Message msgId="user.changePwd"/></MenuItem>
          <MenuItem key="divider" divider />
          <MenuItem key="logout" onClick={this.props.onLogout}><Glyphicon glyph="log-out" /> <Message msgId="user.logout"/></MenuItem>
      </DropDown>);
  },
  renderButtonText() {

      return this.props.renderButtonContent ?
        this.props.renderButtonContent() :
        [<Glyphicon glyph="user" />, this.props.renderButtonText ? this.props.user && this.props.user[this.props.displayName] || "Guest" : null];
  },
  render() {
      return this.props.user && this.props.user[this.props.displayName] ? this.renderLoggedTools() : this.renderGuestTools();
  }
});

module.exports = UserMenu;
