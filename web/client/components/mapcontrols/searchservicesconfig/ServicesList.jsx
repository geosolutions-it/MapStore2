/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { FormGroup, Checkbox, ControlLabel, Glyphicon } from 'react-bootstrap';
import Message from '../../I18N/Message';
import ConfirmButton from '../../buttons/ConfirmButton';
import PropTypes from 'prop-types';

function validate() {
    return true;
}

class ServicesList extends React.Component {
    static propTypes = {
        services: PropTypes.array,
        override: PropTypes.bool,
        service: PropTypes.object,
        onPropertyChange: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        services: [],
        override: false,
        onPropertyChange: () => {}
    };

    getOptions = () => {
        if (this.props.services.length === 0) {
            return (<div className="search-service-name">
                <Message msgId="search.serviceslistempty"/>
            </div>);
        }
        return this.props.services.map((s, idx) => {
            return (
                <div className="search-service-item" key={idx}>
                    <span className="search-service-name">
                        {s.name}
                    </span>
                    <ConfirmButton className="list-remove-btn" onConfirm={() => this.remove(idx)} text={<Glyphicon glyph="remove-circle" />} confirming={{className: "text-warning list-remove-btn", text: <Message msgId="search.confirmremove" />}}/>
                    <Glyphicon onClick={() => this.edit(s, idx)} glyph="pencil"/>
                </div>);
        });
    };

    render() {
        const {override} = this.props;
        return (
            <form>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.serviceslistlabel" />
                    </ControlLabel>
                    <div className="services-list">
                        {this.getOptions()}
                    </div>
                </FormGroup>
                <Checkbox checked={override} onChange={this.toggleOverride}>
                    <Message msgId="search.overriedservice" />
                </Checkbox>
            </form>);
    }

    edit = (s, idx) => {
        this.props.onPropertyChange("init_service_values", s);
        this.props.onPropertyChange("service", s);
        this.props.onPropertyChange("editIdx", idx);
        this.props.onPropertyChange("page", 1);
    };

    toggleOverride = () => {
        const {services, override} = this.props;
        this.props.onPropertyChange("textSearchConfig", {services, override: !override});
    };

    remove = (idx) => {
        const {services, override} = this.props;
        const newServices = services.filter((el, i) => i !== idx);
        this.props.onPropertyChange("textSearchConfig", {services: newServices, override});
    };
}

export default {Element: ServicesList, validate};
