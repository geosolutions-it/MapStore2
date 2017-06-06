/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {FormGroup, ControlLabel, FormControl, Label} = require('react-bootstrap');
const Message = require('../../I18N/Message');
const Slider = require('react-nouislider');
const assign = require('object-assign');
const PropTypes = require('prop-types');

function validate(service = {}) {
    return service.displayName && service.displayName.length > 0;
}

class ResultsProps extends React.Component {
    static propTypes = {
        service: PropTypes.object,
        onPropertyChange: PropTypes.func
    };

    static defaultProps = {
        service: {},
        onPropertyChange: () => {}
    };

    render() {
        const {service} = this.props;
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
                        <Label key="priority-labeel" className="slider-label">{parseInt(service.priority || 1, 10)}</Label>
                    </ControlLabel>
                    <Slider key="priority" start={[service.priority || 1]}
                        range={{min: 1, max: 10}}
                        onSlide={this.updatePriority}
                        />
                    <span className="priority-info"><Message msgId="search.s_priority_info" /></span>
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
}

module.exports = { Element: ResultsProps, validate};
