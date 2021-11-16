/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { find, includes, isObject, isString, uniqBy } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Col, ControlLabel, FormControl, FormGroup, Grid, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import Spinner from 'react-spinkit';

import { getMessageById, getSupportedLocales } from '../../../../utils/LocaleUtils';
import { isValidNewGroupOption, flattenGroups,
    getLabelName as _getLabelName, getTitle as _getTitle } from '../../../../utils/TOCUtils';
import Message from '../../../I18N/Message';
import LayerNameEditField from './LayerNameEditField';

/**
 * General Settings form for layer
 */
class General extends React.Component {
    static propTypes = {
        onChange: PropTypes.func,
        element: PropTypes.object,
        settings: PropTypes.object,
        groups: PropTypes.array,
        nodeType: PropTypes.string,
        pluginCfg: PropTypes.object,
        showTooltipOptions: PropTypes.bool,
        allowNew: PropTypes.bool,
        enableLayerNameEditFeedback: PropTypes.bool,
        currentLocale: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        element: {},
        onChange: () => { },
        nodeType: 'layers',
        showTooltipOptions: true,
        pluginCfg: {},
        allowNew: false,
        currentLocale: 'en-US'
    };

    getTitle = (label) => _getTitle(label, this.props.currentLocale);
    getLabelName = (label, groups) => _getLabelName(this.getTitle(label), groups);

    render() {
        const locales = getSupportedLocales();
        const translations = isObject(this.props.element.title) ? assign({}, this.props.element.title) : { 'default': this.props.element.title };
        const { hideTitleTranslations = false } = this.props.pluginCfg;

        const tooltipItems = [
            { value: "title", label: getMessageById(this.context.messages, "layerProperties.tooltip.title") },
            { value: "description", label: getMessageById(this.context.messages, "layerProperties.tooltip.description") },
            { value: "both", label: getMessageById(this.context.messages, "layerProperties.tooltip.both") },
            { value: "none", label: getMessageById(this.context.messages, "layerProperties.tooltip.none") }
        ];
        const tooltipPlacementItems = [
            { value: "top", label: getMessageById(this.context.messages, "layerProperties.tooltip.top") },
            { value: "right", label: getMessageById(this.context.messages, "layerProperties.tooltip.right") },
            { value: "bottom", label: getMessageById(this.context.messages, "layerProperties.tooltip.bottom") }
        ];
        const groups = this.props.groups && flattenGroups(this.props.groups);
        const eleGroupLabel = this.findGroupLabel(this.props.element && this.props.element.group || "Default");

        const SelectCreatable = this.props.allowNew ? Select.Creatable : Select;

        return (
            <Grid fluid style={{ paddingTop: 15, paddingBottom: 15 }}>
                <form ref="settings">
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId="layerProperties.title" />
                        </ControlLabel>
                        <FormControl
                            defaultValue={translations.default || ""}
                            key="title"
                            type="text"
                            onBlur={this.updateTranslation.bind(null, 'default')} />
                    </FormGroup>
                    {hideTitleTranslations || (<FormGroup>
                        <ControlLabel><Message msgId="layerProperties.titleTranslations" /></ControlLabel>
                        {Object.keys(locales).map((a) => {
                            let flagImgSrc;
                            try {
                                flagImgSrc = require('../../../I18N/images/flags/' + locales[a].code + '.png');
                            } catch (e) {
                                flagImgSrc = false;
                            }
                            return flagImgSrc ? (<InputGroup key={a}>
                                <InputGroup.Addon><img src={flagImgSrc} alt={locales[a].description} /></InputGroup.Addon>
                                <FormControl
                                    placeholder={locales[a].description}
                                    defaultValue={translations[locales[a].code] || ''}
                                    type="text"
                                    onBlur={this.updateTranslation.bind(null, locales[a].code)} />
                            </InputGroup>) : null;
                        }
                        )}
                    </FormGroup>)}
                    {includes(this.supportedNameEditLayerTypes, this.props.element.type) &&
                    <LayerNameEditField
                        element={this.props.element}
                        enableLayerNameEditFeedback={this.props.enableLayerNameEditFeedback}
                        onUpdateEntry={this.updateEntry.bind(null)}/>}
                    <FormGroup>
                        <ControlLabel><Message msgId="layerProperties.description" /></ControlLabel>
                        {this.props.element.capabilitiesLoading ? <Spinner spinnerName="circle" /> :
                            <FormControl
                                defaultValue={this.props.element.description || ''}
                                key="description"
                                rows="2"
                                componentClass="textarea"
                                style={{ resize: "vertical", minHeight: "33px" }}
                                onBlur={this.updateEntry.bind(null, "description")} />}
                    </FormGroup>
                    {this.props.nodeType === 'layers' ?
                        <div>
                            <label key="group-label" className="control-label"><Message msgId="layerProperties.group" /></label>
                            <SelectCreatable
                                clearable={false}
                                key="group-dropdown"
                                options={
                                    uniqBy([
                                        { value: 'Default', label: 'Default' },
                                        ...(groups || (this.props.element && this.props.element.group) || []).map(item => {
                                            if (isObject(item)) {
                                                return {...item, label: this.getLabelName(item.label, groups)};
                                            }
                                            return { label: this.getLabelName(item, groups), value: item };
                                        })
                                    ], 'value')
                                }
                                isValidNewOption={isValidNewGroupOption}
                                newOptionCreator={function(option) {
                                    const { valueKey, label, labelKey } = option;
                                    const value = label.replace(/\./g, '${dot}').replace(/\//g, '.');
                                    return {
                                        [valueKey]: value,
                                        [labelKey]: label,
                                        className: 'Select-create-option-placeholder'
                                    };
                                }}
                                value={{ label: this.getLabelName(eleGroupLabel, groups), value: eleGroupLabel}}
                                placeholder={this.getLabelName(eleGroupLabel, groups)}
                                onChange={(item) => {
                                    this.updateEntry("group", { target: { value: item.value || "Default" } });
                                }}
                            />
                        </div> : null}
                    {   /* Tooltip section */
                        this.props.showTooltipOptions &&
                        <div style={{ width: "100%" }}>
                            <Col xs={12} sm={8} className="first-selectize">
                                <br />
                                <label key="tooltip-label" className="control-label"><Message msgId="layerProperties.tooltip.label" /></label>
                                <Select
                                    clearable={false}
                                    key="tooltips-dropdown"
                                    options={tooltipItems}
                                    value={find(tooltipItems, o => o.value === (this.props.element.tooltipOptions || "title"))}
                                    onChange={(item) => { this.updateEntry("tooltipOptions", { target: { value: item.value || "title" } }); }} />
                            </Col>
                            <Col xs={12} sm={4} className="second-selectize">
                                <br />
                                <label key="tooltip-placement-label" className="control-label"><Message msgId="layerProperties.tooltip.labelPlacement" /></label>
                                <Select
                                    clearable={false}
                                    key="tooltips-placement-dropdown"
                                    options={tooltipPlacementItems}
                                    value={find(tooltipPlacementItems, o => o.value === (this.props.element.tooltipPlacement || "top"))}
                                    onChange={(item) => { this.updateEntry("tooltipPlacement", { target: { value: item.value || "top" } }); }}
                                />
                            </Col>
                        </div>
                    }

                </form>
            </Grid>
        );
    }

    supportedNameEditLayerTypes = ['wms'];

    updateEntry = (key, event) => isObject(key) ? this.props.onChange(key) : this.props.onChange(key, event.target.value);

    updateTranslation = (key, event) => {
        const title = (key === 'default' && isString(this.props.element.title))
            ? event.target.value
            : assign({}, isObject(this.props.element.title) ? this.props.element.title : { 'default': this.props.element.title || '' }, { [key]: event.target.value });

        this.props.onChange('title', title);
    };

    findGroupLabel = () => {
        const wholeGroups = this.props.groups && flattenGroups(this.props.groups, 0, true);
        const eleGroupName = this.props.element && this.props.element.group || "Default";
        const group = find(wholeGroups, (gp)=> gp.id === eleGroupName) || {};
        return this.getTitle(group.title);
    }
}

export default General;
