/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { get } = require('lodash');
const { FormGroup, ControlLabel, FormControl, Label, Checkbox } = require('react-bootstrap');
const Slider = require('react-nouislider');
const assign = require('object-assign');
const PropTypes = require('prop-types');
const Select = require("react-select").default;

const Message = require('../../I18N/Message');
const LocaleUtils = require('../../../utils/LocaleUtils');

function validate(service = {}) {
    return service.displayName && service.displayName.length > 0;
}

class ResultsProps extends React.Component {
    static propTypes = {
        service: PropTypes.object,
        launchInfoPanelOptions: PropTypes.array,
        launchInfoPanelDefault: PropTypes.string,
        launchInfoPanelSelectOptions: PropTypes.object,
        onPropertyChange: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        service: {},
        launchInfoPanelDefault: "no_info",
        launchInfoPanelSelectOptions: {},
        onPropertyChange: () => {}
    };

    render() {
        const {service} = this.props;
        const launchInfoPanelOptions = this.props.launchInfoPanelOptions || [
            {
                label: LocaleUtils.getMessageById(this.context.messages, `search.s_launch_info_panel.no_info`),
                value: "no_info"
            },
            {
                label: LocaleUtils.getMessageById(this.context.messages, `search.s_launch_info_panel.all_layers`),
                value: "all_layers"
            },
            {
                label: LocaleUtils.getMessageById(this.context.messages, `search.s_launch_info_panel.single_layer`),
                value: "single_layer"
            }
        ];
        const currentLaunchInfoPanel = service?.launchInfoPanel || this.props.launchInfoPanelDefault;

        return (
            <form>
                <span className="wfs-required-props-title"><Message msgId="search.s_result_props_label" /></span>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_title" />
                    </ControlLabel>
                    <FormControl
                        value={service.displayName}
                        key="displayName"
                        type="text"
                        placeholder={'e.g. "${properties.name}\"'}
                        onChange={this.updateProp.bind(null, "displayName", null)}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_description" />
                    </ControlLabel>
                    <FormControl
                        value={service.subTitle}
                        key="subTitle"
                        type="text"
                        onChange={this.updateProp.bind(null, "subTitle", null)}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_priority" />
                        <Label key="priority-label" className="slider-label">{parseInt(service.priority || 1, 10)}</Label>
                    </ControlLabel>
                    <Slider key="priority"
                        start={[service.priority || 1]}
                        step={1}
                        range={{min: 1, max: 10}}
                        onSlide={this.updatePriority}
                    />
                    <span className="priority-info"><Message msgId="search.s_priority_info" /></span>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_launch_info_panel.label" />
                    </ControlLabel>
                    <Select
                        options={launchInfoPanelOptions}
                        clearable={false}
                        value={currentLaunchInfoPanel}
                        onChange={this.updateLaunchInfoPanel}
                        {...this.props.launchInfoPanelSelectOptions}
                    />
                    {currentLaunchInfoPanel === 'single_layer' ? <FormGroup>
                        <Checkbox checked={service?.openFeatureInfoButtonEnabled ?? false} onChange={this.updateProp.bind(null, 'openFeatureInfoButtonEnabled', 'target.checked')}>
                            <Message msgId="search.s_launch_info_panel.openFeatureInfoButtonCheckbox"/>
                        </Checkbox>
                        <Checkbox checked={service?.forceSearchLayerVisibility ?? false} onChange={this.updateProp.bind(null, 'forceSearchLayerVisibility', 'target.checked')}>
                            <Message msgId="search.s_launch_info_panel.forceSearchLayerVisibility"/>
                        </Checkbox>
                    </FormGroup> : null}
                    <span className="priority-info with-top-margin">
                        <Message msgId={`search.s_launch_info_panel.${currentLaunchInfoPanel}_description`} />
                    </span>
                </FormGroup>
            </form>);
    }

    updateProp = (prop, path, event) => {
        const value = get(event, path || 'target.value');
        this.props.onPropertyChange("service", assign({}, this.props.service, {[prop]: value}));
    };

    updatePriority = (val) => {
        this.props.onPropertyChange("service", assign({}, this.props.service, {priority: parseFloat(val[0], 10)}));
    };
    updateLaunchInfoPanel = (val) => {
        // determine launchInfoPanel value
        let launchInfoPanel = val && val.value ? val.value : "";
        if ( launchInfoPanel === "no_info" ) {
            // avoid to use a value for default behaviour i.e. without record search
            launchInfoPanel = undefined;
        }
        this.props.onPropertyChange("service", {
            ...this.props.service,
            launchInfoPanel,
            openFeatureInfoButtonEnabled: false,
            forceSearchLayerVisibility: false
        });
    };
}

module.exports = { Element: ResultsProps, validate};
