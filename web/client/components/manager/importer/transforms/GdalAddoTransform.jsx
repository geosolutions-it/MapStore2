/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Input} = require('react-bootstrap');
const assign = require('object-assign');


const {Message, Alert} = require('../../../I18N/I18N');

const GdalTranslateTransform = React.createClass({
    propTypes: {
        transform: React.PropTypes.object,
        editTransform: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            transform: {
                options: [],
                levels: []
            },
            editTransform: () => {},
            updateTransform: () => {}
        };
    },
    onChange(event) {
        let value = event.target.value || "";
        this.props.editTransform(assign({}, this.props.transform, {[event.target.name]: value.split(/\s+/g) }));
    },
    renderInvalid() {
        if (!this.isValid(this.props.transform)) {
            return (<Alert bsStyle="danger" key="error">This transform is not valid</Alert>);
        }
    },
    render() {
        return (<form>
            <Message msgId="importer.transform.options" /><Input name="options" onChange={this.onChange} type="text" value={(this.props.transform.options || []).join(" ")} />
            <Message msgId="importer.transform.overviewlevels" /><Input name="levels" onChange={this.onChange} type="text" value={(this.props.transform.levels || []).join(" ")} />
            {this.renderInvalid()}
        </form>);
    },
    isValid(t) {
        return t && t.options && t.options.findIndex((e) => e === "") < 0 &&
            t.levels && t.levels.findIndex((e) => e === "") < 0;
    }
});
module.exports = GdalTranslateTransform;
