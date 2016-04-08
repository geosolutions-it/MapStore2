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
const PasswordReset = require('./PasswordReset');
const {DropdownButton, MenuItem, Glyphicon, Modal, Button} = require('react-bootstrap');


  /**
   * A DropDown menu for user details:
   */
const UserMenu = React.createClass({
  propTypes: {
      // props
      user: React.PropTypes.object,
      displayName: React.PropTypes.string,
      showDetails: React.PropTypes.bool,
      showPasswordReset: React.PropTypes.bool,
      showLogin: React.PropTypes.bool,
      displayAttributes: React.PropTypes.displayAttributes,


      // CALLBACKS
      onShowAccountInfo: React.PropTypes.func,
      onShowChangePassword: React.PropTypes.func,
      onPasswordChange: React.PropTypes.func,
      onLogout: React.PropTypes.func
  },
  getDefaultProps() {
      return {
          user: {
              name: "Guest"
          },
          onLogout: () => {},
          onPasswordChange: () => {},
          displayName: "name",
          showDetails: false,
          showPasswordReset: false,
          showLogin: false,
          displayAttributes: (attr) => {
              return attr.name === "email";
          }
      };
  },
  getInitialState() {
      return {
          showDetails: false,
          showPasswordReset: false,
          showLogin: false,
          passwordValid: false
      };
  },
  onShowAccountInfo() {
      this.setState({showDetails: true});
  },
  onShowChangePassword() {
      this.setState({showPasswordReset: true});
  },
  onShowLogin() {
      this.setState({showLogin: true});
  },
  onPasswordChange() {
      this.props.onPasswordChange(this.props.user, this.refs.passwordResetForm.getPassword());
  },
  renderModals() {
      return [ this.renderPasswordReset(), this.renderUserDetails()];
  },
  renderPasswordReset() {

      return (<Modal show={this.state.showPasswordReset} onHide={this.closeModals}>
          <Modal.Header key="passwordChange" closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <PasswordReset ref="passwordResetForm"
                  onChange={() => {
                      this.setState({passwordValid: this.refs.passwordResetForm.isValid()});
                  }} />
          </Modal.Body>
          <Modal.Footer>
            <Button
                bsStyle="primary"
                onClick={this.onPasswordReset}
                disabled={!this.state.passwordValid}
                onClick={this.onPasswordChange}>Reset Password</Button>
            <Button onClick={this.closeModals}>Close</Button>
          </Modal.Footer>
      </Modal>);
  },
  renderAttributes() {
      if (!this.props.user || !this.props.user.attribute) {
          return null;
      }
      let attrs = this.props.user.attribute.filter(this.props.displayAttributes);

      let attrsRendered = attrs.map((attr) => {
          return (<tr><th>{attr.name}</th><td> {attr.value}</td></tr>);
      });
      return <table>{attrsRendered}</table>;
  },
  renderUserDetails() {
      return (<Modal show={this.state.showDetails} onHide={this.closeModals}>
          <Modal.Header key="details" closeButton>
            <Modal.Title>User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              {this.renderAttributes()}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModals}>Close</Button>
          </Modal.Footer>
      </Modal>);
  },
  renderGuestTools(username) {
      return (<DropdownButton key="loginButton" pullRight bsStyle="primary" title={username} key="user-menu" id="dropdown-basic-primary">
          <MenuItem key="login" onClick={this.showLogin}><Glyphicon glyph="log-out" /> Login</MenuItem>
      </DropdownButton>);
  },
  renderLoggedTools(username) {
      return (
      <DropdownButton key="loginButton" pullRight bsStyle="primary" title={username} key="user-menu" id="dropdown-basic-primary">
          <MenuItem key="accountInfo" onClick={this.props.onShowAccountInfo || this.onShowAccountInfo}> <Glyphicon glyph="user" /> Account Info</MenuItem>
          <MenuItem key="passwordChange" onClick={this.props.onShowChangePassword || this.onShowChangePassword}> <Glyphicon glyph="asterisk" /> Change Password</MenuItem>
          <MenuItem key="divider" divider />
          <MenuItem key="logout" onClick={this.props.onLogout}><Glyphicon glyph="log-out" /> Logout</MenuItem>
      </DropdownButton>);
  },
  render() {
      let username = (<span><Glyphicon glyph="user" /> {this.props.user && this.props.user[this.props.displayName] || "Guest"}</span>);
      return (
          <div>
            {this.props.user && this.props.user[this.props.displayName] ? this.renderLoggedTools(username) : this.renderGuestTools(username)}
         {this.renderModals()}
        </div>
      );
  },
  closeModals() {
      this.setState({showDetails: false, showPasswordReset: false});
  }
});

module.exports = UserMenu;
