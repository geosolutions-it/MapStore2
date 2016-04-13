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
const PasswordReset = require('../forms/PasswordReset');
const {Modal, Button} = require('react-bootstrap');


  /**
   * A Modal window to show password reset form
   */
const PasswordResetModal = React.createClass({
  propTypes: {
      // props
      user: React.PropTypes.object,
      show: React.PropTypes.bool,
      onPasswordChange: React.PropTypes.func,
      onClose: React.PropTypes.func
  },
  getDefaultProps() {
      return {
          user: {
              name: "Guest"
          },
          onPasswordChange: () => {},
          onClose: () => {}
      };
  },
  getInitialState() {
      return {
        passwordValid: false
      };
  },
  onPasswordChange() {
      this.props.onPasswordChange(this.props.user, this.refs.passwordResetForm.getPassword());
  },
  render() {
      return (<Modal show={this.props.show} onHide={this.props.onClose}>
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
                ref="passwordChangeButton"
                key="passwordChangeButton"
                bsStyle="primary"
                disabled={!this.state.passwordValid}
                onClick={this.onPasswordChange}>Reset Password</Button>
            <Button
                key="closeButton"
                ref="closeButton"
                onClick={this.props.onClose}>Close</Button>
          </Modal.Footer>
      </Modal>);
  }
});

module.exports = PasswordResetModal;
