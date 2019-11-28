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
const moment = require('moment');
const ConfigUtils = require('../../../utils/ConfigUtils');

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
        descriptionPlaceholderText: PropTypes.string,
        createdAtFieldText: PropTypes.string,
        modifiedAtFieldText: PropTypes.string
    };

    static contextTypes = {
        intl: PropTypes.object
    }

    static defaultProps = {
        // CALLBACKS
        onChange: () => {},

        // I18N
        nameFieldText: "Name",
        descriptionFieldText: "Description",
        namePlaceholderText: "Map Name",
        descriptionPlaceholderText: "Map Description"
    };


    renderDate = (date) => {
        if (!date) {
            return '';
        }
        const dateFormat = ConfigUtils.getConfigProp('forceDateFormat');
        const timeFormat = ConfigUtils.getConfigProp('forceTimeFormat');
        const newDate = dateFormat ? moment(date).format(dateFormat) : this.context.intl ? this.context.intl.formatDate(date) : '';
        const time = timeFormat ? moment(date).format(timeFormat) : this.context.intl ? this.context.intl.formatTime(date) : '';
        return `${newDate} ${time}` || '';
    }

    render() {
        return (<form ref="metadataForm" onSubmit={this.handleSubmit}>
            <FormGroup validationState={this.isMapNameValid}>
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
            <FormGroup>
                <ControlLabel>{this.props.createdAtFieldText}</ControlLabel>
                <ControlLabel>{this.props.map && this.renderDate(this.props.map.creation) || ""}</ControlLabel>
            </FormGroup>
            <FormGroup>
                <ControlLabel>{this.props.modifiedAtFieldText}</ControlLabel>
                <ControlLabel>{this.props.map && this.renderDate(this.props.map.lastUpdate || this.props.map.creation) || ""}</ControlLabel>
            </FormGroup>
        </form>);
    }

    changeName = (e) => {
        this.props.onChange('name', e.target.value);
    };

    changeDescription = (e) => {
        this.props.onChange('description', e.target.value);
    };

    isMapNameValid = () => {
        return (this.props.map && this.props.map.metadata && this.props.map.metadata.name === '') ? 'error' : null;
    };
}


module.exports = Metadata;
