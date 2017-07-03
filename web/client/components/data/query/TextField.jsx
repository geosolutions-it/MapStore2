/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {FormControl, Tooltip} = require('react-bootstrap');
const LocaleUtils = require('../../../utils/LocaleUtils');
const OverlayTrigger = require('../../../components/misc/OverlayTrigger');
const HTML = require('../../../components/I18N/HTML');
const PropTypes = require('prop-types');
const {isLikeOrIlike} = require('../../../utils/FilterUtils');

class TextField extends React.Component {
    static propTypes = {
        operator: PropTypes.string,
        fieldName: PropTypes.string,
        fieldRowId: PropTypes.number,
        attType: PropTypes.string,
        fieldValue: PropTypes.string,
        label: PropTypes.string,
        fieldException: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.string
        ]),
        onUpdateField: PropTypes.func,
        onUpdateExceptionField: PropTypes.func,
        style: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        operator: "like",
        fieldName: null,
        fieldRowId: null,
        attType: "string",
        fieldValue: null,
        label: null,
        fieldException: null,
        onUpdateField: () => {},
        onUpdateExceptionField: () => {},
        style: {}
    };
    componentDidMount() {
        if (this.props.operator === "isNull" && !this.props.fieldValue) {
            this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, " ", this.props.attType);
        }
    }
    componentDidUpdate() {
        if (this.props.operator === "isNull" && !this.props.fieldValue) {
            this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, " ", this.props.attType);
        }
    }
    renderField = () => {
        let placeholder = LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.text_placeholder");
        let tooltip = <Tooltip id={"textField-tooltip" + this.props.fieldRowId}><HTML msgId="queryform.attributefilter.tooltipTextField"/></Tooltip>;
        let field = (<FormControl
            disabled={this.props.operator === "isNull"}
            placeholder={placeholder}
            onChange={this.changeText}
            type="text"
            value={this.props.fieldValue || ''}
        />);

        return isLikeOrIlike(this.props.operator) ? (<OverlayTrigger key={"textField-overlay" + this.props.fieldRowId} placement="top" overlay={tooltip}>
            {field}
        </OverlayTrigger>) : field;
    }
    render() {
        let label = this.props.label ? <label>{this.props.label}</label> : <span/>;
        return (
            <div className="textField">
                {label}
                {this.renderField()}
            </div>);
    }
    changeText = (e) => {
        this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, e.target.value, this.props.attType);
    };
}

module.exports = TextField;
