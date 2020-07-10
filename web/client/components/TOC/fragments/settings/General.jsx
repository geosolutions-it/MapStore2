/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Spinner = require('react-spinkit');
const { FormControl, FormGroup, ControlLabel, InputGroup, Col } = require('react-bootstrap');
const Message = require('../../../I18N/Message');
const { SimpleSelect } = require('react-selectize');
const { isString, isObject, find } = require('lodash');
const LocaleUtils = require('../../../../utils/LocaleUtils');
const assign = require('object-assign');
require('react-selectize/themes/index.css');
const { Grid } = require('react-bootstrap');
const { createFromSearch, flattenGroups } = require('../../../../utils/TOCUtils');
const TOCUtils = require('../../../../utils/TOCUtils');

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
        allowNew: PropTypes.bool
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
        allowNew: false
    };

    render() {
        const locales = LocaleUtils.getSupportedLocales();
        const translations = isObject(this.props.element.title) ? assign({}, this.props.element.title) : { 'default': this.props.element.title };
        const { hideTitleTranslations = false } = this.props.pluginCfg;

        const tooltipItems = [
            { value: "title", label: LocaleUtils.getMessageById(this.context.messages, "layerProperties.tooltip.title") },
            { value: "description", label: LocaleUtils.getMessageById(this.context.messages, "layerProperties.tooltip.description") },
            { value: "both", label: LocaleUtils.getMessageById(this.context.messages, "layerProperties.tooltip.both") },
            { value: "none", label: LocaleUtils.getMessageById(this.context.messages, "layerProperties.tooltip.none") }
        ];
        const tooltipPlacementItems = [
            { value: "top", label: LocaleUtils.getMessageById(this.context.messages, "layerProperties.tooltip.top") },
            { value: "right", label: LocaleUtils.getMessageById(this.context.messages, "layerProperties.tooltip.right") },
            { value: "bottom", label: LocaleUtils.getMessageById(this.context.messages, "layerProperties.tooltip.bottom") }
        ];
        const groups = this.props.groups && flattenGroups(this.props.groups);
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
                    <FormGroup>
                        <ControlLabel><Message msgId="layerProperties.name" /></ControlLabel>
                        <FormControl
                            defaultValue={this.props.element.name || ''}
                            key="name"
                            type="text"
                            disabled
                            onBlur={this.updateEntry.bind(null, "name")} />
                    </FormGroup>
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
                            <SimpleSelect
                                key="group-dropdown"
                                options={
                                    (groups || (this.props.element && this.props.element.group) || []).map(item => {
                                        if (isObject(item)) {
                                            return {...item, label: TOCUtils.getLabelName(item.label, groups)};
                                        }
                                        return { label: TOCUtils.getLabelName(item, groups), value: item };
                                    })
                                }
                                defaultValue={{ label: TOCUtils.getLabelName(this.props.element && this.props.element.group || "Default", groups), value: this.props.element && this.props.element.group || "Default" }}
                                placeholder={TOCUtils.getLabelName(this.props.element && this.props.element.group || "Default", groups)}
                                onChange={(value) => {
                                    this.updateEntry("group", { target: { value: value || "Default" } });
                                }}
                                theme="bootstrap3"
                                createFromSearch={this.props.allowNew ? createFromSearch : undefined}
                                hideResetButton={!this.props.allowNew}
                                editable={this.props.allowNew}
                                onValueChange={function(item) {
                                    // here, we add the selected item to the options array, the "new-option"
                                    // property, added to items created by the "create-from-search" function above,
                                    // helps us ensure that the item doesn't already exist in the options array
                                    if (!!item && !!item.newOption) {
                                        this.options.unshift({ label: item.label, value: item.value });
                                    }
                                    this.onChange(item ? item.value : null);
                                }} />
                        </div> : null}
                    {   /* Tooltip section */
                        this.props.showTooltipOptions &&
                        <div style={{ width: "100%" }}>
                            <Col xs={12} sm={8} className="first-selectize">
                                <br />
                                <label key="tooltip-label" className="control-label"><Message msgId="layerProperties.tooltip.label" /></label>
                                <SimpleSelect
                                    hideResetButton
                                    dropdownDirection={-1}
                                    key="tooltips-dropdown"
                                    options={tooltipItems}
                                    theme="bootstrap3"
                                    value={find(tooltipItems, o => o.value === (this.props.element.tooltipOptions || "title"))}
                                    onValueChange={(item) => { this.updateEntry("tooltipOptions", { target: { value: item.value || "title" } }); }} />
                            </Col>
                            <Col xs={12} sm={4} className="second-selectize">
                                <br />
                                <label key="tooltip-placement-label" className="control-label"><Message msgId="layerProperties.tooltip.labelPlacement" /></label>
                                <SimpleSelect
                                    hideResetButton
                                    dropdownDirection={-1}
                                    key="tooltips-placement-dropdown"
                                    options={tooltipPlacementItems}
                                    theme="bootstrap3"
                                    value={find(tooltipPlacementItems, o => o.value === (this.props.element.tooltipPlacement || "top"))}
                                    onValueChange={(item) => { this.updateEntry("tooltipPlacement", { target: { value: item.value || "top" } }); }} />
                            </Col>
                        </div>
                    }

                </form>
            </Grid>
        );
    }

    updateEntry = (key, event) => isObject(key) ? this.props.onChange(key) : this.props.onChange(key, event.target.value);

    updateTranslation = (key, event) => {
        const title = (key === 'default' && isString(this.props.element.title))
            ? event.target.value
            : assign({}, isObject(this.props.element.title) ? this.props.element.title : { 'default': this.props.element.title || '' }, { [key]: event.target.value });

        this.props.onChange('title', title);
    };
}

module.exports = General;
