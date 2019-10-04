/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {FormGroup, ControlLabel, FormControl} = require('react-bootstrap');
const Message = require('../../I18N/Message');
const assign = require('object-assign');
const PropTypes = require('prop-types');

// const weburl = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
function validate(service = {}) {
    const {options = {}, name = ''} = service;
    const {url = '', typeName = '', queriableAttributes = ''} = options;
    // const p = url.search(weburl);
    return name.length > 0 && url.length > 0 && typeName.length > 0 && queriableAttributes.length > 0;
}

class WFSServiceProps extends React.Component {
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
                <span className="wfs-required-props-title"><Message msgId="search.s_wfs_props_label" /></span>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_name" />
                    </ControlLabel>
                    <FormControl
                        value={service.name}
                        key="name"
                        type="text"
                        onChange={this.updateName}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_url" />
                    </ControlLabel>
                    <FormControl
                        value={options.url}
                        key="url"
                        type="text"
                        onChange={this.updateProp.bind(null, "url")}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_layer" />
                    </ControlLabel>
                    <FormControl
                        value={options.typeName}
                        key="typeName"
                        type="text"
                        onChange={this.updateProp.bind(null, "typeName")}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="search.s_attributes" />
                    </ControlLabel>
                    <FormControl
                        value={([options.queriableAttributes] || []).join(",")}
                        key="queriableAttributes"
                        type="text"
                        onChange={this.updateProp.bind(null, "queriableAttributes")}/>
                </FormGroup>
            </form>);
    }

    updateProp = (prop, event) => {
        let value = event.target.value;
        if (prop === "queriableAttributes") {
            value = value.split(",");
        }
        const options = assign({}, this.props.service.options, {[prop]: value} );
        this.props.onPropertyChange("service", assign({}, this.props.service, {options}));
    };

    updateName = (event) => {
        const value = event.target.value;
        this.props.onPropertyChange("service", assign({}, this.props.service, {name: value}));
    };

    updateMaxFeatures = (val) => {
        const options = assign({}, this.props.service.options, {maxFeatures: parseFloat(val[0], 10)});
        this.props.onPropertyChange("service", assign({}, this.props.service, {options}));
    };
}

module.exports = { Element: WFSServiceProps, validate};
