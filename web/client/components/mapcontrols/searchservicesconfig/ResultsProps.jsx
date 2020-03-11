/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {FormGroup, ControlLabel, FormControl, Label} = require('react-bootstrap');
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
        onPropertyChange: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        service: {},
        launchInfoPanelDefault: "no_info",
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
                        onChange={this.updateProp.bind(null, "displayName")}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_description" />
                    </ControlLabel>
                    <FormControl
                        value={service.subTitle}
                        key="subTitle"
                        type="text"
                        onChange={this.updateProp.bind(null, "subTitle")}/>
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
                        value={service && service.launchInfoPanel || this.props.launchInfoPanelDefault}
                        onChange={this.updateLaunchInfoPanel}
                    />
                    <span className="priority-info with-top-margin">
                        <Message msgId={`search.s_launch_info_panel.${service && service.launchInfoPanel || this.props.launchInfoPanelDefault}_description`} />
                    </span>
                </FormGroup>
            </form>);
    }

    updateProp = (prop, event) => {
        const value = event.target.value;
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
        this.props.onPropertyChange("service", {...this.props.service, launchInfoPanel});
    };
}

module.exports = { Element: ResultsProps, validate};
