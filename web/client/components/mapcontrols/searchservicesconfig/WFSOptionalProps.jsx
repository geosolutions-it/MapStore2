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

function validate() {
    return true;
}

class WFSOptionalProps extends React.Component {
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
        const {options = {}} = service;
        return (
            <form>
                <span className="wfs-required-props-title"><Message msgId="search.s_wfs_opt_props_label" /></span>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_sort" />
                    </ControlLabel>
                    <FormControl
                        value={options.sortBy}
                        key="sortBy"
                        type="text"
                        onChange={this.updateProp.bind(null, "sortBy")}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_max_features" />
                    </ControlLabel>
                    <Slider key="maxFeatures" start={[options.maxFeatures || 1]}
                        range={{min: 1, max: 50}}
                        onSlide={this.updateSliderProps.bind(null, "maxFeatures")}
                    />
                    <Label key="maxFeatures-label" className="slider-label" >{options.maxFeatures || 1}</Label>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_max_zoom" />
                    </ControlLabel>
                    <Slider key="maxZoomLevel" start={[options.maxZoomLevel || 21]}
                        range={{min: 1, max: 35}}
                        onSlide={this.updateSliderProps.bind(null, "maxZoomLevel")}
                    />
                    <Label key="maxZoomLevel-label" className="slider-label" >{options.maxZoomLevel || 21}</Label>
                </FormGroup>
            </form>);
    }

    updateProp = (prop, event) => {
        const value = event.target.value;
        const options = assign({}, this.props.service.options, {[prop]: value});
        this.props.onPropertyChange("service", assign({}, this.props.service, {options}));
    };

    updateSliderProps = (props, val) => {
        const options = {...this.props.service.options, [props]: parseInt(val[0], 10)};
        this.props.onPropertyChange("service", {...this.props.service, options});
    };
}

module.exports = {Element: WFSOptionalProps, validate};
