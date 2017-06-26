const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {FormControl, Alert} = require('react-bootstrap');
const assign = require('object-assign');

const {Message} = require('../../../I18N/I18N');
const {findIndex} = require('lodash');

class GdalTranslateTransform extends React.Component {
    static propTypes = {
        transform: PropTypes.object,
        editTransform: PropTypes.func,
        updateTransform: PropTypes.func
    };

    static defaultProps = {
        transform: {
            options: []
        },
        editTransform: () => {},
        updateTransform: () => {}
    };

    onChange = (event) => {
        let value = event.target.value || "";
        this.props.editTransform(assign({}, this.props.transform, {[event.target.name]: value.split(/\s+/g) }));
    };

    renderInvalid = () => {
        if (!this.isValid(this.props.transform)) {
            return <Alert bsStyle="danger" key="error">This transform is not valid</Alert>;
        }
    };

    render() {
        return (<div>
            <Message msgId="importer.transform.options" key="opt-label"/><FormControl key="options" name="options" onChange={this.onChange} type="text" value={(this.props.transform.options || []).join(" ")} />
            {this.renderInvalid()}
        </div>);
    }

    isValid = (t) => {
        return t && t.options && findIndex(t.options, (e) => e === "") < 0;
    };
}

module.exports = GdalTranslateTransform;
