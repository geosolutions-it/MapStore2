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
const Metadata = React.createClass({
  propTypes: {
      map: React.PropTypes.object,
      // CALLBACKS
      onChange: React.PropTypes.func,

      // I18N
      nameFieldText: React.PropTypes.node,
      descriptionFieldText: React.PropTypes.node,
      namePlaceholderText: React.PropTypes.string,
      descriptionPlaceholderText: React.PropTypes.string
  },
  getDefaultProps() {
      return {
          // CALLBACKS
          onChange: () => {},

          // I18N
          nameFieldText: "Name",
          descriptionFieldText: "Description",
          namePlaceholderText: "Map Name",
          descriptionPlaceholderText: "Map Description"
      };
  },
  render() {
      return (<form ref="metadataForm" onSubmit={this.handleSubmit}>
          <Input ref="mapName"
              key="mapName"
              hasFeedback
              type="text"
              label={this.props.nameFieldText}
              onChange={this.props.onChange}
              placeholder={this.props.namePlaceholderText}
              defaultValue={this.props.map ? this.props.map.name : ""} />
          <Input ref="mapDescription"
              key="mapDescription"
              hasFeedback
              type="text"
              label={this.props.descriptionFieldText}
              onChange={this.props.onChange}
              placeholder={this.props.descriptionPlaceholderText}
              defaultValue={this.props.map ? this.props.map.description : ""} />
      </form>);
  },
  setMapNameValue(newName) {
      this.refs.mapName.setValue(newName || "");
  },
  isValid() {
      if (!this.refs.mapName) {
          return false;
      }
      let pw = this.refs.mapName.getValue();
      return pw !== null;
  }
});

module.exports = Metadata;
