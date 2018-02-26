const PropTypes = require('prop-types');
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
const {FormControl, FormGroup, ControlLabel} = require('react-bootstrap');

/**
 * A DropDown menu for user details:
 */
class Metadata extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        // CALLBACKS
        onChange: PropTypes.func,

        // I18N
        nameFieldText: PropTypes.node,
        descriptionFieldText: PropTypes.node,
        namePlaceholderText: PropTypes.string,
        descriptionPlaceholderText: PropTypes.string
    };

    static defaultProps = {
        // CALLBACKS
        onChange: () => {},

        // I18N
        nameFieldText: "Name",
        descriptionFieldText: "Description",
        namePlaceholderText: "Map Name",
        descriptionPlaceholderText: "Map Description"
    };

    render() {
        return (<form ref="metadataForm" onSubmit={this.handleSubmit}>
            <FormGroup>
                <ControlLabel>{this.props.nameFieldText}</ControlLabel>
                <FormControl ref="mapName"
                    key="mapName"
                    type="text"
                    onChange={this.changeName}
                    disabled={this.props.map.saving}
                    placeholder={this.props.namePlaceholderText}
                    defaultValue={this.props.map ? this.props.map.name : ""}
                    value={this.props.map && this.props.map.metadata && this.props.map.metadata.name || ""}/>
            </FormGroup>
            <FormGroup>
                <ControlLabel>{this.props.descriptionFieldText}</ControlLabel>
                <FormControl ref="mapDescription"
                    key="mapDescription"
                    type="text"
                    onChange={this.changeDescription}
                    disabled={this.props.map.saving}
                    placeholder={this.props.descriptionPlaceholderText}
                    defaultValue={this.props.map ? this.props.map.description : ""}
                    value={this.props.map && this.props.map.metadata && this.props.map.metadata.description || ""}/>
            </FormGroup>
        </form>);
    }

    changeName = (e) => {
        this.props.onChange('name', e.target.value);
    };

    changeDescription = (e) => {
        this.props.onChange('description', e.target.value);
    };
}


module.exports = Metadata;
