/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { castArray, find, includes, isNil, isObject, uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Checkbox, Col, ControlLabel, FormControl, FormGroup, Grid } from 'react-bootstrap';
import LocalizedInput from '../../../misc/LocalizedInput';

import Select from 'react-select';
import Spinner from 'react-spinkit';

import Message from '../../../I18N/Message';
import SwitchPanel from '../../../misc/switch/SwitchPanel';
import EditableTextField from './EditableTextField';
import LayerNameEditField from './LayerNameEditField';
import { getMessageById } from '../../../../utils/LocaleUtils';
import {
    isValidNewGroupOption,
    getLabelName as _getLabelName
} from '../../../../plugins/TOC/utils/TOCUtils';
import { supportsFeatureEditing } from "../../../../utils/FeatureGridUtils";
import { DEFAULT_GROUP_ID, flattenGroups, getTitle as _getTitle } from '../../../../utils/LayersUtils';
import { getFeatureLayerSchema } from '../../../../api/ArcGIS';
import { loadFields } from '../LayerFields';
import { addSearch, getLayerCapabilities as getWMSLayerCapabilities } from '../../../../observables/wms';

const formatURL = (url) => Array.isArray(url) ? url.join(', ') : url || '';
const parseURL = (url) => {
    const urls = url.split(',').map((value) => value.trim());
    return urls.length > 1 ? urls : urls[0];
};
const mergeArcGISFields = (fields = [], previousFields = []) => fields.map((field) => {
    const previousField = previousFields.find(({name}) => name === field.name);
    return {
        ...field,
        ...(previousField && Object.prototype.hasOwnProperty.call(previousField, 'alias') && {alias: previousField.alias}),
        ...(previousField && Object.prototype.hasOwnProperty.call(previousField, 'visible') && {visible: previousField.visible})
    };
});
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
        onLayerNameValidationError: PropTypes.func,
        currentLocale: PropTypes.string,
        showFeatureEditOption: PropTypes.bool
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

    canEditLayerName = () => {
        const {element = {}, nodeType} = this.props;
        if (nodeType !== 'layers' || !includes(this.supportedNameEditLayerTypes, element.type)) {
            return false;
        }
        return element.type !== 'arcgis' || !isNil(element.name) && `${element.name}`.trim() !== '';
    };

    getLayerNameValidator = () => {
        const {element = {}} = this.props;
        const usesLayerNameForWFS = element.type === 'wfs'
            || element.type === 'wms'
                && element.search?.type === 'wfs'
                && isNil(element.search.typeName);
        return usesLayerNameForWFS || element.type === 'arcgis-feature'
            ? this.validateLayerName
            : undefined;
    };

    validateLayerName = (name) => {
        const {element = {}} = this.props;
        if (element.type === 'wfs' || element.type === 'wms') {
            return loadFields({...element, name}, true)
                .then((fields) => ({fields}));
        }
        if (element.type === 'arcgis-feature') {
            return getFeatureLayerSchema(element.url, name, {
                authSourceId: element.security?.sourceId
            }).then(({fields, properties, geometryType}) => ({
                fields: mergeArcGISFields(fields, element.fields),
                properties,
                geometryType
            }));
        }
        return Promise.resolve();
    };

    validateLayerURL = (url) => {
        const nextLayer = { ...this.props.element, url };
        if (nextLayer.type === 'wfs') {
            return loadFields({
                ...nextLayer,
                describeFeatureTypeURL: undefined,
                search: nextLayer.search && {
                    ...nextLayer.search,
                    url: undefined
                }
            }, true);
        }
        return Promise.all(castArray(url).map((currentUrl) =>
            getWMSLayerCapabilities({ ...nextLayer, url: currentUrl })
                .toPromise()
                .then((layerCapability) => {
                    if (!layerCapability) {
                        throw new Error('Layer not found in WMS capabilities');
                    }
                    return layerCapability;
                })
        ));
    };

    validateLinkedWFS = (search) => {
        const typeName = search.typeName ?? this.props.element.name;
        if (!search.url?.trim() || !typeName?.trim()) {
            return Promise.reject(new Error('WFS URL and typeName are required'));
        }
        return loadFields({
            ...this.props.element,
            describeFeatureTypeURL: undefined,
            search: {
                ...search,
                typeName
            }
        }, true);
    };

    updateWFSPanel = (enabled) => {
        if (!enabled) {
            this.props.onChange('search', undefined);
            return;
        }
        const emptySearch = { type: 'wfs', url: '', typeName: '' };
        addSearch(this.props.element, { detectedSearchOverrides: true })
            .toPromise()
            .then(({ search }) => {
                const detectedSearch = {
                    ...search,
                    type: 'wfs',
                    url: search?.url || '',
                    typeName: search?.typeName || ''
                };
                if (!detectedSearch.url || !detectedSearch.typeName) {
                    this.props.onChange('search', detectedSearch);
                    return;
                }
                this.validateLinkedWFS(detectedSearch)
                    .then((fields) => this.props.onChange({ search: detectedSearch, fields }))
                    .catch(() => this.props.onChange('search', detectedSearch));
            })
            .catch(() => this.props.onChange('search', emptySearch));
    };

    render() {
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
        const eleGroupLabel = this.findGroupLabel(this.props.element && this.props.element.group || DEFAULT_GROUP_ID);

        const SelectCreatable = this.props.allowNew ? Select.Creatable : Select;

        return (
            <Grid fluid style={{ paddingTop: 15, paddingBottom: 15 }}>
                <form ref="settings">
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId="layerProperties.title" />
                        </ControlLabel>
                        <LocalizedInput
                            key="title"
                            showTranslateTool={!hideTitleTranslations}
                            value={this.props.element.title}
                            onChange={this.updateTitle} />
                    </FormGroup>
                    {this.canEditLayerName() &&
                    <LayerNameEditField
                        element={this.props.element}
                        enableLayerNameEditFeedback={this.props.enableLayerNameEditFeedback}
                        onValidate={this.getLayerNameValidator()}
                        onValidationError={this.props.onLayerNameValidationError}
                        onUpdateEntry={this.updateLayerName}/>}
                    {includes(this.supportedURLEditLayerTypes, this.props.element.type) &&
                    <EditableTextField
                        dataQa="layer-properties-url"
                        labelId="layerProperties.url"
                        value={this.props.element.url}
                        formatValue={formatURL}
                        parseValue={parseURL}
                        required
                        onValidate={this.validateLayerURL}
                        onChange={(url, fields) => this.props.onChange({
                            url,
                            ...(this.props.element.type === 'wfs' && { fields })
                        })} />}
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
                        <div className={"form-group"}>
                            <label key="group-label" className="control-label"><Message msgId="layerProperties.group" /></label>
                            <SelectCreatable
                                clearable={false}
                                key="group-dropdown"
                                options={
                                    uniqBy([
                                        { value: DEFAULT_GROUP_ID, label: DEFAULT_GROUP_ID },
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
                                    this.updateEntry("group", { target: { value: item.value || DEFAULT_GROUP_ID } });
                                }}
                            />
                        </div> : null}
                    {   /* Tooltip section */
                        this.props.showTooltipOptions &&
                        <div style={{ width: "100%", display: "inline-block" }}>
                            <Col xs={12} sm={8} className="first-selectize">
                                <label key="tooltip-label" className="control-label"><Message msgId="layerProperties.tooltip.label" /></label>
                                <Select
                                    clearable={false}
                                    key="tooltips-dropdown"
                                    options={tooltipItems}
                                    value={find(tooltipItems, o => o.value === (this.props.element.tooltipOptions || "title"))}
                                    onChange={(item) => { this.updateEntry("tooltipOptions", { target: { value: item.value || "title" } }); }} />
                            </Col>
                            <Col xs={12} sm={4} className="second-selectize">
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
                    {supportsFeatureEditing(this.props.element) && this.props.showFeatureEditOption && <FormGroup>
                        <Checkbox
                            data-qa="general-read-only-attribute"
                            key="disableFeaturesEditing"
                            checked={this.props.element?.disableFeaturesEditing === undefined ? false : this.props.element?.disableFeaturesEditing}
                            onChange={(event) => this.props.onChange("disableFeaturesEditing", event.target.checked)}
                        >
                            <Message msgId="layerProperties.disableFeaturesEditing"/>
                        </Checkbox>
                    </FormGroup>}
                    {this.props.element.type === 'wms' && <SwitchPanel
                        expanded={!!this.props.element.search}
                        title={<Message msgId="layerProperties.wfsLinkedService" />}
                        onSwitch={this.updateWFSPanel}>
                        <EditableTextField
                            dataQa="layer-properties-search-url"
                            labelId="layerProperties.url"
                            value={this.props.element.search?.url}
                            required
                            onValidate={(url) => this.validateLinkedWFS({
                                ...this.props.element.search,
                                url
                            })}
                            onChange={(url, fields) => this.props.onChange({
                                search: {
                                    ...this.props.element.search,
                                    url
                                },
                                fields
                            })} />
                        <EditableTextField
                            dataQa="layer-properties-search-type-name"
                            labelId="layerProperties.typeName"
                            value={this.props.element.search?.typeName ?? this.props.element.name}
                            required
                            onValidate={(typeName) => this.validateLinkedWFS({
                                ...this.props.element.search,
                                typeName
                            })}
                            onChange={(typeName, fields) => this.props.onChange({
                                search: {
                                    ...this.props.element.search,
                                    typeName
                                },
                                fields
                            })} />
                    </SwitchPanel>}

                </form>
            </Grid>
        );
    }

    supportedNameEditLayerTypes = ['wms', 'wfs', 'arcgis', 'arcgis-feature'];
    supportedURLEditLayerTypes = ['wms', 'wfs'];

    updateEntry = (key, event) => isObject(key) ? this.props.onChange(key) : this.props.onChange(key, event.target.value);
    updateLayerName = (key, event, properties) => this.props.onChange({
        [key]: event.target.value,
        ...(properties || {})
    });
    updateTitle = (title) => this.props.onChange("title", title);

    findGroupLabel = () => {
        const wholeGroups = this.props.groups && flattenGroups(this.props.groups, 0, true);
        const eleGroupName = this.props.element && this.props.element.group || DEFAULT_GROUP_ID;
        const group = find(wholeGroups, (gp)=> gp.id === eleGroupName) || {};
        return this.getTitle(group.title);
    }
}

export default General;
