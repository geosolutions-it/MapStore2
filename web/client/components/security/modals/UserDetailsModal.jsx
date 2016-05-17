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

const {Modal, Button, Table} = require('react-bootstrap');


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
      onClose: React.PropTypes.func
  },
  getDefaultProps() {
      return {
          user: {
              name: "Guest"
          },
          displayAttributes: (attr) => {
              return attr.name === "email";
          },
          onClose: () => {},
          options: {}
      };
  },
  renderAttributes() {
      if (!this.props.user || !this.props.user.attribute) {
          return null;
      }
      let attrs = this.props.user.attribute.filter(this.props.displayAttributes);

      let attrsRendered = attrs.map((attr) => {
          return (<tr key={attr.name + "-row"}><th>{attr.name}</th><td> {attr.value}</td></tr>);
      });
      return <Table responsive striped condensed hover><tbody>{attrsRendered}</tbody></Table>;
  },
  render() {
      return (<Modal {...this.props.options} show={this.props.show} onHide={this.props.onClose}>
          <Modal.Header key="details" closeButton>
            <Modal.Title>User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              {this.renderAttributes()}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.onClose}>Close</Button>
          </Modal.Footer>
      </Modal>);
  }

});

module.exports = UserDetails;
