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
const {Modal, Button} = require('react-bootstrap');


  /**
   * A Modal window to show password reset form
   */
const UserMenu = React.createClass({
  propTypes: {
      // props
      user: React.PropTypes.object,
      onPasswordChange: React.PropTypes.func
  },
  getDefaultProps() {
      return {
          user: {
              name: "Guest"
          },
          onPasswordChange: () => {}
      };
  },
  onPasswordChange() {
      this.props.onPasswordChange(this.props.user, this.refs.passwordResetForm.getPassword());
  },
  render() {

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
  closeModals() {
      this.setState({show: false});
  }
});

module.exports = UserMenu;
