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
const LoginForm = require('../forms/LoginForm');
const {Modal, Button} = require('react-bootstrap');


  /**
   * A Modal window to show password reset form
   */
const LoginModal = React.createClass({
  propTypes: {
      // props
      user: React.PropTypes.object,
      loginError: React.PropTypes.object,
      show: React.PropTypes.bool,

      // CALLBACKS
      onLoginSuccess: React.PropTypes.func,
      onSubmit: React.PropTypes.func,
      onError: React.PropTypes.func,
      onClose: React.PropTypes.func
  },
  getDefaultProps() {
      return {
          onLoginSuccess: () => {},
          onSubmit: () => {},
          onError: () => {},
          onClose: () => {}
      };
  },
  render() {
      return (<Modal show={this.props.show} onHide={this.props.onClose}>
          <Modal.Header key="passwordChange" closeButton>
            <Modal.Title>Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <LoginForm
                  ref="loginForm"
                  showSubmitButton={false}
                  user={this.props.user}
                  loginError={this.props.loginError}
                  onLoginSuccess={this.props.onLoginSuccess}
                  onSubmit={this.props.onSubmit}
                  onError={this.props.onError}
                  />
          </Modal.Body>
          <Modal.Footer>
              <Button
                  ref="submit"
                  value="Sign-in"
                  bsStyle="primary"
                  className="pull-left"
                  onClick={this.loginSubmit}
                  key="submit">Sign-in</Button>
            <Button
                key="closeButton"
                ref="closeButton"
                onClick={this.props.onClose}>Close</Button>
          </Modal.Footer>
      </Modal>);
  },
  loginSubmit() {
      this.refs.loginForm.submit();
  }
});

module.exports = LoginModal;
