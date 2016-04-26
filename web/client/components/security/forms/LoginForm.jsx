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
const {Input, ButtonInput, Alert} = require('react-bootstrap');
const Spinner = require('react-spinkit');


  /**
   * A Form to login menu for user details:
   */
const LoginForm = React.createClass({
    propTypes: {
      // props
      user: React.PropTypes.object,
      onLoginSuccess: React.PropTypes.func,
      showSubmitButton: React.PropTypes.bool,
      loginError: React.PropTypes.object,

      // actions
      onSubmit: React.PropTypes.func,
      onError: React.PropTypes.func,

      // localization
      userNameText: React.PropTypes.node,
      passwordText: React.PropTypes.node,
      loginFailedStatusMessages: React.PropTypes.object,
      loginFailedMessage: React.PropTypes.node
    },
    getDefaultProps() {
        return {
          onSubmit: () => {},
          onLoginError: () => {},
          showSubmitButton: true,
          userNameText: "Username",
          passwordText: "Password",
          loginFailedMessage: "Login Fail",
          loginFailedStatusMessages: {
              0: "Please insert username and password",
              401: "Username or password incorrect"
          }

      };
    },
    componentWillReceiveProps(nextProps) {
        let newUser = nextProps.user;
        let oldUser = this.props.user;
        let userChange = newUser !== oldUser;
        if ( newUser && userChange ) {
            this.props.onLoginSuccess(nextProps.user);
        }
        this.setState({
            loading: false
        } );
    },
    getInitialState() {
        return {loading: false};
    },
    renderError() {
        let error = this.props.loginError;
        if (error) {
            return (<Alert bsStyle="danger" key="errorMessage">
                    <strong>{this.props.loginFailedMessage}</strong> {this.renderErrorText(error)}
              </Alert>);
        }
        return null;
    },
    renderErrorText(error) {
        return this.props.loginFailedStatusMessages[error.status] || error.status;
    },
    renderLoading() {
        return this.state.loading ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn/> : null;
    },
    renderSubmit() {
        if (this.props.showSubmitButton) {
            return (<ButtonInput
                type="submit"
                value="Sign-in"
                bsStyle="primary"
                key="submit"/>);
        }
    },
    render() {
        return (
            <form ref="loginForm" onSubmit={this.handleSubmit}>
                <Input ref="username"
                    key="username"
                    type="text"
                    label={this.props.userNameText}
                    onChange={this.handleUsernameChangethis}
                    placeholder="User Name" />
                <Input ref="password"
                    key="password"
                    type="password"
                    label={this.props.passwordText}
                    onChange={this.handlePasswordChange}
                    placeholder="Password" />
                {this.renderSubmit()}
                {this.renderError()}
                <div style={{"float": "right"}}>{this.renderLoading()}</div>
            </form>
        );
    },

    handleSubmit(e) {
        e.preventDefault();
        this.submit();
    },
    submit() {
        let username = this.refs.username && this.refs.username.getValue();
        let password = this.refs.password && this.refs.password.getValue();
        if (!username || !password) {
            this.props.onError({status: 0});
        }
        this.props.onSubmit(username, password);
        this.setState({loading: true});
    }
});

module.exports = LoginForm;
