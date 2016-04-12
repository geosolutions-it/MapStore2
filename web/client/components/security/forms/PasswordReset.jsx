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
const {Input} = require('react-bootstrap');

  /**
   * A DropDown menu for user details:
   */
const PasswordReset = React.createClass({
  propTypes: {
      // config
      minPasswordSize: React.PropTypes.number,
      // CALLBACKS
      onChange: React.PropTypes.func,

      // I18N
      newPasswordText: React.PropTypes.node,
      passwordCheckText: React.PropTypes.node
  },
  getDefaultProps() {
      return {
          // config
          minPasswordSize: 6,

          // CALLBACKS
          onChange: () => {},

          // I18N
          newPasswordText: "New Password",
          passwordCheckText: "Retype Password"

      };
  },
  getPassword() {
      if (this.isValid()) {
          return this.refs.password.getValue();
      }
  },
  getPwStyle() {
      if (!this.refs.password) {
          return null;
      }
      let pw = this.refs.password.getValue();
      if (pw.length === 0) {
          return null;
      }
      return pw.length > this.props.minPasswordSize ? "success" : "warning";

  },
  render() {
      return (<form ref="loginForm" onSubmit={this.handleSubmit}>
          <Input ref="password"
              key="password"
              type="password"
              hasFeedback
              label={this.props.newPasswordText}
              bsStyle={this.getPwStyle()}
              onChange={this.props.onChange}
              placeholder="New Password" />
          <Input ref="passwordcheck"
              key="passwordcheck"
              bsStyle={this.isValid() && this.getPwStyle() ? "success" : "error"}
              hasFeedback
              type="password"
              label={this.props.passwordCheckText}
              onChange={this.props.onChange}
              placeholder="Retype Password" />
      </form>);
  },
  isValid() {
      if (!this.refs.password) {
          return false;
      }
      let pw = this.refs.password.getValue();
      return pw !== null && pw.length > this.props.minPasswordSize && pw === this.refs.passwordcheck.getValue();
  }
});

module.exports = PasswordReset;
