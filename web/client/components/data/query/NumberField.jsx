const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Tooltip} = require("react-bootstrap");
const OverlayTrigger = require('../../misc/OverlayTrigger');
const LocaleUtils = require('../../../utils/LocaleUtils');
const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
numberLocalizer();
const {NumberPicker} = require('react-widgets');

class NumberField extends React.Component {
    static propTypes = {
        operator: PropTypes.string,
        fieldName: PropTypes.string,
        fieldRowId: PropTypes.number,
        attType: PropTypes.string,
        fieldValue: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.object]),
        fieldException: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool,
            PropTypes.string
        ]),
        onUpdateField: PropTypes.func,
        onUpdateExceptionField: PropTypes.func,
        isRequired: PropTypes.bool,
        label: PropTypes.string,
        lowLabel: PropTypes.string,
        upLabel: PropTypes.string,
        options: PropTypes.shape({
            format: PropTypes.string,
            min: PropTypes.number,
            max: PropTypes.number,
            step: PropTypes.number,
            precision: PropTypes.number
        }),
        style: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        style: { borderColor: "#dedede"},
        operator: "=",
        fieldName: null,
        fieldRowId: null,
        attType: "number",
        fieldValue: null,
        fieldException: null,
        isRequired: false,
        label: null,
        lowLabel: null,
        upLabel: null,
        options: {},
        onUpdateField: () => {},
        onUpdateExceptionField: () => {}
    };

    renderPicker = (style) => {
        let label = this.props.label ? <label>{this.props.label}</label> : null;
        let lowLabel = this.props.lowLabel ? <label>{this.props.lowLabel}</label> : null;
        let upLabel = this.props.upLabel ? <label>{this.props.upLabel}</label> : null;
        return this.props.operator === "><" ?
            <div className="query-field">
                <div className="query-field-value">
                    {lowLabel}
                    <NumberPicker
                        style={style}
                        value={this.props.fieldValue && (this.props.fieldValue.lowBound !== null && this.props.fieldValue.lowBound !== undefined) ? this.props.fieldValue.lowBound : null}
                        onChange={(value) => !isNaN(value) && this.changeNumber({lowBound: value, upBound: this.props.fieldValue && (this.props.fieldValue.upBound !== null && this.props.fieldValue.upBound !== undefined ) ? this.props.fieldValue.upBound : null})}
                        {...this.props.options}
                    />
                </div>
                <div className="query-field-value">
                    {upLabel}
                    <NumberPicker
                        style={style}
                        value={this.props.fieldValue && (this.props.fieldValue.upBound !== null && this.props.fieldValue.upBound !== undefined ) ? this.props.fieldValue.upBound : null}
                        onChange={(value) => !isNaN(value) && this.changeNumber({upBound: value, lowBound: this.props.fieldValue && (this.props.fieldValue.lowBound !== null && this.props.fieldValue.lowBound !== undefined) ? this.props.fieldValue.lowBound : null})}
                        {...this.props.options}
                    />
                </div>
            </div>
            :
            <div>
                {label}
                <NumberPicker
                    style={style}
                    value={this.props.fieldValue && (this.props.fieldValue.lowBound !== null && this.props.fieldValue.lowBound !== undefined) ? this.props.fieldValue.lowBound : this.props.fieldValue}
                    onChange={(value) => !isNaN(value) && this.changeNumber(value)}
                    {...this.props.options}
                />
            </div>
        ;
    };

    render() {
        let style = this.props.style;
        if (this.props.fieldException) {
            style = {...this.props.style, borderColor: "#FF0000"};
        }
        return (
            <OverlayTrigger placement="bottom"
                overlay={this.props.fieldException ?
                    <Tooltip id={this.props.fieldRowId + "_tooltip"}>
                        <strong>
                            {this.props.fieldException}
                        </strong>
                    </Tooltip>
                    : <noscript/>}>
                {this.renderPicker(style)}
            </OverlayTrigger>
        );
    }

    changeNumber = (value) => {
        if (this.props.operator === "><") {
            if (value.lowBound !== null && value.lowBound !== undefined && ( value.upBound !== null && value.upBound !== undefined) && value.lowBound >= value.upBound) {
                this.props.onUpdateExceptionField(this.props.fieldRowId, LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.numberfield.wrong_range"));
            } else if (this.props.fieldException) {
                this.props.onUpdateExceptionField(this.props.fieldRowId, null);
            }
        } else {
            if (this.props.isRequired && ( value === null || value === undefined)) {
                this.props.onUpdateExceptionField(this.props.fieldRowId, LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.numberfield.isRequired"));
            } else if (this.props.fieldException) {
                this.props.onUpdateExceptionField(this.props.fieldRowId, null);
            }
        }

        this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, value, this.props.attType);
    };
}

module.exports = NumberField;
