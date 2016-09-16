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

const {Modal, Button, Table, Glyphicon} = require('react-bootstrap');
const Dialog = require('../../../components/misc/Dialog');
const assign = require('object-assign');
const SecurityUtils = require('../../../utils/SecurityUtils');
const Message = require('../../../components/I18N/Message');

  /**
   * A Modal window to show password reset form
   */
const UserDetails = React.createClass({
  propTypes: {
      // props
      user: React.PropTypes.object,
      show: React.PropTypes.bool,
      displayAttributes: React.PropTypes.func,
      options: React.PropTypes.object,
      onClose: React.PropTypes.func,
      useModal: React.PropTypes.bool,
      closeGlyph: React.PropTypes.string,
      style: React.PropTypes.object,
      buttonSize: React.PropTypes.string,
      includeCloseButton: React.PropTypes.bool
  },
  getDefaultProps() {
      return {
          user: {
              name: "Guest"
          },
          displayAttributes: (attr) => {
              return attr.name !== "UUID";
          },
          onClose: () => {},
          options: {},
          useModal: true,
          closeGlyph: "",
          style: {},
          buttonSize: "large",
          includeCloseButton: true
      };
  },
  renderAttributes() {
      if (!this.props.user || !this.props.user.attribute) {
          return null;
      }
      let userAttributes = SecurityUtils.getUserAttributes(this.props.user);
      let attrsRendered = userAttributes.filter(this.props.displayAttributes).map((attr) => {
          return (<tr key={attr.name + "-row"}><th>{attr.name}</th><td> {attr.value}</td></tr>);
      });
      return <Table role="body" responsive striped condensed hover><tbody>{attrsRendered}</tbody></Table>;
  },
  render() {
      const footer = this.props.includeCloseButton ? <Button bsSize={this.props.buttonSize} onClick={this.props.onClose}><Message msgId="messages.close"/></Button> : <span/>;
      return this.props.useModal ? (
          <Modal {...this.props.options} show={this.props.show} onHide={this.props.onClose}>
              <Modal.Header key="details" closeButton>
                <Modal.Title>User Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  {this.renderAttributes()}
              </Modal.Body>
              <Modal.Footer>
                {footer}
              </Modal.Footer>
          </Modal>) : (
          <Dialog id="mapstore-user-panel" style={assign({}, this.props.style, {display: this.props.show ? "block" : "none"})}>
              <span role="header"><span className="user-panel-title">Login</span><button onClick={this.props.onClose} className="login-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button></span>
              {this.renderAttributes()}
              {footer}
          </Dialog>
      );
  }

});

module.exports = UserDetails;
