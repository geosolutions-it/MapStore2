/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { castArray, find, includes, isEqual, isNil, isObject, uniqBy } from 'lodash';
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
const isEmptyRequiredValue = (value) => Array.isArray(value)
    ? !value.length || value.some(isEmptyRequiredValue)
    : isNil(value) || `${value}`.trim() === '';
const rejectRequiredValue = () => {
    const error = new Error('A service URL and layer or type name are required');
    error.required = true;
    return Promise.reject(error);
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

    state = {
        drafts: {},
        nodeKey: this.props.element?.id ?? this.props.settings?.node
    };

    static getDerivedStateFromProps(props, state) {
        const nodeKey = props.element?.id ?? props.settings?.node;
        if (nodeKey !== state.nodeKey) {
            return {
                drafts: {},
                nodeKey
            };
        }
        const committedValues = {
            name: props.element?.name,
            url: props.element?.url,
            searchUrl: props.element?.search?.url,
            searchTypeName: props.element?.search?.typeName
        };
        const drafts = {...state.drafts};
        let changed = false;
        Object.keys(committedValues).forEach((property) => {
            if (Object.prototype.hasOwnProperty.call(drafts, property)
                && isEqual(drafts[property], committedValues[property])) {
                delete drafts[property];
                changed = true;
            }
        });
        return changed ? {drafts} : null;
    }

    setDraft = (property, value) => this.setState(({drafts}) => ({
        drafts: {
            ...drafts,
            [property]: value
        }
    }));

    clearSearchDrafts = () => this.setState(({drafts}) => {
        const nextDrafts = {...drafts};
        delete nextDrafts.searchUrl;
        delete nextDrafts.searchTypeName;
        return {drafts: nextDrafts};
    });

    hasDraft = (property) => Object.prototype.hasOwnProperty.call(this.state.drafts, property);

    getDraft = (property, fallback) => this.hasDraft(property)
        ? this.state.drafts[property]
        : fallback;

    isDraftPending = (property, committedValue) => this.hasDraft(property)
        && !isEqual(this.state.drafts[property], committedValue);

    getCurrentLayer = (overrides = {}) => {
        const {element = {}} = this.props;
        const hasSearchDraft = this.hasDraft('searchUrl') || this.hasDraft('searchTypeName');
        const currentSearch = (element.search || hasSearchDraft)
            ? {
                ...(element.search || {}),
                url: this.getDraft('searchUrl', element.search?.url),
                typeName: this.getDraft('searchTypeName', element.search?.typeName)
            }
            : element.search;
        return {
            ...element,
            name: this.getDraft('name', element.name),
            url: this.getDraft('url', element.url),
            ...(currentSearch && {search: currentSearch}),
            ...overrides,
            ...(overrides.search && {
                search: {
                    ...(currentSearch || {}),
                    ...overrides.search
                }
            })
        };
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
        return includes(['wms', 'wfs', 'arcgis-feature'], element.type)
            ? this.validateLayerName
            : undefined;
    };

    validateLayerName = (name) => {
        const nextLayer = this.getCurrentLayer({name});
        if (nextLayer.type === 'wfs') {
            return this.validateNativeWFS(nextLayer)
                .then((fields) => ({fields}));
        }
        if (nextLayer.type === 'wms') {
            return this.validateWMS(nextLayer)
                .then(() => nextLayer.search?.type === 'wfs' && isNil(nextLayer.search.typeName)
                    ? this.validateLinkedWFSLayer(nextLayer).then((fields) => ({fields}))
                    : {});
        }
        if (nextLayer.type === 'arcgis-feature') {
            return getFeatureLayerSchema(nextLayer.url, name, {
                authSourceId: nextLayer.security?.sourceId
            }).then(({fields, properties, geometryType}) => ({
                fields: mergeArcGISFields(fields, nextLayer.fields),
                properties,
                geometryType
            }));
        }
        return Promise.resolve();
    };

    validateLayerURL = (url) => {
        const nextLayer = this.getCurrentLayer({url});
        if (nextLayer.type === 'wfs') {
            return this.validateNativeWFS(nextLayer);
        }
        return this.validateWMS(nextLayer);
    };

    validateWMS = (layer) => {
        const urls = castArray(layer.url);
        if (!urls.length || urls.some(isEmptyRequiredValue) || isEmptyRequiredValue(layer.name)) {
            return rejectRequiredValue();
        }
        return Promise.all(urls.map((currentUrl) =>
            getWMSLayerCapabilities({ ...layer, url: currentUrl })
                .toPromise()
                .then((layerCapability) => {
                    if (!layerCapability) {
                        throw new Error('Layer not found in WMS capabilities');
                    }
                    return layerCapability;
                })
        ));
    };

    validateNativeWFS = (layer) => {
        if (isEmptyRequiredValue(layer.url) || isEmptyRequiredValue(layer.name)) {
            return rejectRequiredValue();
        }
        return loadFields({
            ...layer,
            describeFeatureTypeURL: undefined,
            search: layer.search && {
                ...layer.search,
                url: undefined
            }
        }, true);
    };

    validateLinkedWFSLayer = (layer) => {
        const typeName = layer.search?.typeName ?? layer.name;
        if (isEmptyRequiredValue(layer.search?.url) || isEmptyRequiredValue(typeName)) {
            return rejectRequiredValue();
        }
        return loadFields({
            ...layer,
            describeFeatureTypeURL: undefined,
            search: {
                ...layer.search,
                typeName
            }
        }, true);
    };

    validateLinkedWFS = (search) => this.validateLinkedWFSLayer(
        this.getCurrentLayer({search})
    );

    updateWFSPanel = (enabled) => {
        this.clearSearchDrafts();
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
        const editorResetKey = this.props.element?.id ?? this.props.settings?.node;
        const waitForNameLayerLoad = this.props.enableLayerNameEditFeedback
            && !this.isDraftPending('url', this.props.element.url);
        const waitForURLLayerLoad = this.props.enableLayerNameEditFeedback
            && !this.isDraftPending('name', this.props.element.name);

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
                        enableLayerNameEditFeedback={waitForNameLayerLoad}
                        onValidate={this.getLayerNameValidator()}
                        onDraftChange={(name) => this.setDraft('name', name)}
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
                        resetKey={editorResetKey}
                        waitForLayerLoad={!!waitForURLLayerLoad}
                        layerLoading={!!this.props.element.loading}
                        layerLoadingError={this.props.element.loadingError}
                        onValidate={this.validateLayerURL}
                        onDraftChange={(url) => this.setDraft('url', url)}
                        onChange={(url, fields, {forced} = {}) => this.props.onChange({
                            url,
                            ...(this.props.element.type === 'wfs' && { fields: forced ? undefined : fields })
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
                            resetKey={editorResetKey}
                            onValidate={(url) => this.validateLinkedWFS({url})}
                            onDraftChange={(url) => this.setDraft('searchUrl', url)}
                            onChange={(url, fields, {forced} = {}) => this.props.onChange({
                                search: {
                                    ...this.props.element.search,
                                    url
                                },
                                fields: forced ? undefined : fields
                            })} />
                        <EditableTextField
                            dataQa="layer-properties-search-type-name"
                            labelId="layerProperties.typeName"
                            value={this.props.element.search?.typeName ?? this.props.element.name}
                            required
                            resetKey={editorResetKey}
                            onValidate={(typeName) => this.validateLinkedWFS({typeName})}
                            onDraftChange={(typeName) => this.setDraft('searchTypeName', typeName)}
                            onChange={(typeName, fields, {forced} = {}) => this.props.onChange({
                                search: {
                                    ...this.props.element.search,
                                    typeName
                                },
                                fields: forced ? undefined : fields
                            })} />
                    </SwitchPanel>}

                </form>
            </Grid>
        );
    }

    supportedNameEditLayerTypes = ['wms', 'wfs', 'arcgis', 'arcgis-feature'];
    supportedURLEditLayerTypes = ['wms', 'wfs'];

    updateEntry = (key, event) => isObject(key) ? this.props.onChange(key) : this.props.onChange(key, event.target.value);
    updateLayerName = (key, event, properties, {forced} = {}) => {
        const {element = {}} = this.props;
        const controlsWFSSchema = element.type === 'wfs'
            || element.type === 'wms'
                && element.search?.type === 'wfs'
                && isNil(element.search.typeName);
        this.props.onChange({
            [key]: event.target.value,
            ...(properties || {}),
            ...(forced && controlsWFSSchema && {fields: undefined})
        });
    };
    updateTitle = (title) => this.props.onChange("title", title);

    findGroupLabel = () => {
        const wholeGroups = this.props.groups && flattenGroups(this.props.groups, 0, true);
        const eleGroupName = this.props.element && this.props.element.group || DEFAULT_GROUP_ID;
        const group = find(wholeGroups, (gp)=> gp.id === eleGroupName) || {};
        return this.getTitle(group.title);
    }
}

export default General;
