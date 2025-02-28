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

import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormControl as BFormControl, ControlLabel, FormGroup, Checkbox } from 'react-bootstrap';
import get from 'lodash/get';

import ConfigUtils from '../../../utils/ConfigUtils';
import localizedProps from '../../misc/enhancers/localizedProps';

const FormControl = localizedProps('placeholder')(BFormControl);

/**
 * A DropDown menu for user details:
 * @deprecated
 */
class Metadata extends React.Component {
    static propTypes = {
        resource: PropTypes.object,
        // CALLBACKS
        onChange: PropTypes.func,

        // I18N
        nameFieldText: PropTypes.node,
        titleFieldText: PropTypes.node,
        descriptionFieldText: PropTypes.node,
        nameFieldFilter: PropTypes.func,
        namePlaceholderText: PropTypes.string,
        descriptionPlaceholderText: PropTypes.string,
        titlePlaceholderText: PropTypes.string,
        createdAtFieldText: PropTypes.string,
        modifiedAtFieldText: PropTypes.string,
        unadvertisedText: PropTypes.string,
        creatorFieldText: PropTypes.string,
        editorFieldText: PropTypes.string
    };

    static contextTypes = {
        intl: PropTypes.object
    }

    static defaultProps = {
        // CALLBACKS
        onChange: () => {},
        resource: {},
        // I18N
        nameFieldText: "Name",
        descriptionFieldText: "Description",
        nameFieldFilter: () => {},
        namePlaceholderText: "Map Name",
        descriptionPlaceholderText: "Map Description",
        unadvertisedText: "Unadvertised",
        creatorFieldText: "Creator",
        editorFieldText: "Editor"
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
        const title = get(this.props.resource, 'attributes.title', "");
        return (<form ref="metadataForm" onSubmit={this.handleSubmit}>
            <FormGroup>
                <ControlLabel>{this.props.nameFieldText}</ControlLabel>
                <FormControl
                    key="mapName"
                    type="text"
                    onChange={this.changeName}
                    disabled={this.props.resource.saving}
                    placeholder={this.props.namePlaceholderText}
                    defaultValue={this.props.resource ? this.props.resource.name : ""}
                    value={this.props.resource && this.props.resource.metadata && this.props.resource.metadata.name || ""} />
            </FormGroup>
            {!!title && <FormGroup>
                <ControlLabel>{this.props.titleFieldText}</ControlLabel>
                <FormControl
                    key="mapTitle"
                    type="text"
                    onChange={this.changeTitle}
                    disabled={this.props.resource.saving}
                    placeholder={this.props.titlePlaceholderText}
                    defaultValue={title}
                    value={title} />
            </FormGroup>}
            <FormGroup>
                <ControlLabel>{this.props.descriptionFieldText}</ControlLabel>
                <FormControl
                    key="mapDescription"
                    type="text"
                    onChange={this.changeDescription}
                    disabled={this.props.resource.saving}
                    placeholder={this.props.descriptionPlaceholderText}
                    defaultValue={this.props.resource ? this.props.resource.description : ""}
                    value={this.props.resource && this.props.resource.metadata && this.props.resource.metadata.description || ""} />
            </FormGroup>
            {
                this.props.resource && this.props.resource.creator && <FormGroup>
                    <ControlLabel>{this.props.creatorFieldText}</ControlLabel>
                    <ControlLabel>{this.props.resource.creator}</ControlLabel>
                </FormGroup>
            }
            {
                this.props.resource && this.props.resource.createdAt && <FormGroup>
                    <ControlLabel>{this.props.createdAtFieldText}</ControlLabel>
                    <ControlLabel>{this.props.resource && this.renderDate(this.props.resource.createdAt) || ""}</ControlLabel>
                </FormGroup>
            }
            {
                this.props.resource && this.props.resource.editor && <FormGroup>
                    <ControlLabel>{this.props.editorFieldText}</ControlLabel>
                    <ControlLabel>{this.props.resource.editor}</ControlLabel>
                </FormGroup>
            }
            {
                this.props.resource && this.props.resource.createdAt && <FormGroup>
                    <ControlLabel>{this.props.modifiedAtFieldText}</ControlLabel>
                    <ControlLabel>{this.props.resource && this.renderDate(this.props.resource.modifiedAt || this.props.resource.createdAt) || ""}</ControlLabel>
                </FormGroup>
            }
            {
                <FormGroup>
                    <ControlLabel>{this.props.unadvertisedText}</ControlLabel>
                    <Checkbox checked={!this.props.resource?.metadata?.advertised} onChange={this.changeAdvertised} aria-label="advertisedResource"/>
                </FormGroup>
            }
        </form>);
    }

    changeName = (e) => {
        this.props.onChange('metadata.name', this.props.nameFieldFilter(e.target.value) || e.target.value);
    };

    changeDescription = (e) => {
        this.props.onChange('metadata.description', e.target.value);
    };

    changeTitle = (e) => {
        this.props.onChange('attributes.title', e.target.value);
    };
    changeAdvertised = (e) => {
        this.props.onChange('metadata.advertised', !e.target.checked);
    };
}


export default Metadata;
