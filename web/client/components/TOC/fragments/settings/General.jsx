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
const {FormControl, FormGroup, ControlLabel, InputGroup} = require('react-bootstrap');
const Message = require('../../../I18N/Message');
const {SimpleSelect} = require('react-selectize');
const {isString, isObject} = require('lodash');
const LocaleUtils = require('../../../../utils/LocaleUtils');
const assign = require('object-assign');
require('react-selectize/themes/index.css');

/**
 * General Settings form for layer
 */
class General extends React.Component {
    static propTypes = {
        updateSettings: PropTypes.func,
        element: PropTypes.object,
        groups: PropTypes.array,
        nodeType: PropTypes.string
    };

    static defaultProps = {
        element: {},
        updateSettings: () => {},
        nodeType: 'layers'
    };

    getGroups = (groups, idx = 0) => {
        return groups.filter((group) => group.nodes).reduce((acc, g) => {
            acc.push({label: g.id.replace(/\./g, '/').replace(/\${dot}/g, '.'), value: g.id});
            if (g.nodes.length > 0) {
                return acc.concat(this.getGroups(g.nodes, idx + 1));
            }
            return acc;
        }, []);
    };

    getLabelName = (groupLable = "") => {
        return groupLable.replace(/\./g, '/').replace(/\${dot}/g, '.');
    };

    render() {
        const locales = LocaleUtils.getSupportedLocales();
        const translations = isObject(this.props.element.title) ? assign({}, this.props.element.title) : { 'default': this.props.element.title };
        return (
            <form ref="settings">
                <FormGroup>
                    <ControlLabel><Message msgId="layerProperties.title" /></ControlLabel>
                    <FormControl
                        value={translations.default}
                        key="title"
                        type="text"
                        onChange={this.updateTranslation.bind(null, 'default')}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel><Message msgId="layerProperties.titleTranslations" /></ControlLabel>
                    {Object.keys(locales).map((a) =>
                        <InputGroup key={a}>
                            <InputGroup.Addon><img src={require('../../../I18N/images/flags/' + locales[a].code + '.png')} alt={locales[a].description}/></InputGroup.Addon>
                            <FormControl
                                placeholder={locales[a].description}
                                value={translations[locales[a].code] ? translations[locales[a].code] : ''}
                                type="text"
                                onChange={this.updateTranslation.bind(null, locales[a].code)}/>
                        </InputGroup>
                    )}
                </FormGroup>
                <FormGroup>
                    <ControlLabel><Message msgId="layerProperties.name" /></ControlLabel>
                    <FormControl
                        value={this.props.element.name}
                        key="name"
                        type="text"
                        disabled
                        onChange={this.updateEntry.bind(null, "name")}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel><Message msgId="layerProperties.description" /></ControlLabel>
                    {this.props.element.capabilitiesLoading ? <Spinner spinnerName="circle"/> :
                    <FormControl
                        value={this.props.element.description}
                        key="description"
                        rows="2"
                        componentClass="textarea"
                        style={{ resize: "vertical", minHeight: "33px" }}
                        onChange={this.updateEntry.bind(null, "description")}/>}
                </FormGroup>
                { this.props.nodeType === 'layers' ?
                <div>
                    <label key="group-label" className="control-label"><Message msgId="layerProperties.group" /></label>
                    <SimpleSelect
                        key="group-dropdown"
                        options={
                            ((this.props.groups && this.getGroups(this.props.groups)) || (this.props.element && this.props.element.group) || []).map(function(item) {
                                if (isObject(item)) {
                                    return item;
                                }
                                return {label: this.getLabelName(item), value: item};
                            })
                        }
                        defaultValue={{label: this.getLabelName((this.props.element && this.props.element.group || "Default")), value: this.props.element && this.props.element.group || "Default" }}
                        placeholder={this.getLabelName((this.props.element && this.props.element.group || "Default"))}
                        onChange={(value) => {
                            this.updateEntry("group", {target: {value: value || "Default"}});
                        }}
                        theme = "bootstrap3"
                        createFromSearch={function(options, search) {
                            // only create an option from search if the length of the search string is > 0 and
                            // it does no match the label property of an existing option
                            if (search.length === 0 || (options.map(function(option) {
                                return option.label;
                            })).indexOf(search) > -1) {
                                return null;
                            }
                            const val = search.replace(/\./g, '${dot}').replace(/\//g, '.');
                            return {label: search, value: val};
                        }}

                        onValueChange={function(item) {
                            // here, we add the selected item to the options array, the "new-option"
                            // property, added to items created by the "create-from-search" function above,
                            // helps us ensure that the item doesn't already exist in the options array
                            if (!!item && !!item.newOption) {
                                this.options.unshift({label: item.label, value: item.value});
                            }
                            this.onChange(item ? item.value : null);
                        }}/>
                </div> : null}
            </form>
        );
    }

    updateEntry = (key, event) => {
        let value = event.target.value;
        this.props.updateSettings({[key]: value});
    };

    updateTranslation = (key, event) => {
        if (key === 'default' && isString(this.props.element.title)) {
            this.props.updateSettings({title: event.target.value});
        } else {
            this.props.updateSettings({title: assign({}, isObject(this.props.element.title) ? this.props.element.title : {'default': this.props.element.title || ''}, {[key]: event.target.value})});
        }
    };
}

module.exports = General;
