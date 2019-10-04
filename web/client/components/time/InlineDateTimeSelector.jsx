
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Form, FormGroup, FormControl, Glyphicon: GlyphiconRB, Button} = require('react-bootstrap');
const tooltip = require('../misc/enhancers/tooltip');
const Glyphicon = tooltip(GlyphiconRB);
const {padStart, isNil} = require('lodash');
const moment = require('moment');

class InlineDateTimeSelector extends React.Component {
    static propTypes = {
        date: PropTypes.string,
        clickable: PropTypes.bool,
        onUpdate: PropTypes.func,
        onIconClick: PropTypes.func,
        glyph: PropTypes.string,
        style: PropTypes.object,
        className: PropTypes.string,
        tooltip: PropTypes.string,
        tooltipId: PropTypes.string,
        showButtons: PropTypes.bool
    };

    static defaultProps = {
        date: '',
        onIconClick: () => {},
        clickable: false,
        onUpdate: () => {},
        glyph: 'time',
        style: {},
        className: '',
        tooltip: ''
    };

    onUpdate = (key, add) => {
        const currentTime = moment(this.props.date).utc();
        const newTime = add ? moment(currentTime).add(1, key) : moment(currentTime).subtract(1, key);
        // check validity of date. this can become NaN when time exceeds max time (+/-864e13 milliseconds -- from Apr 20 -271821 to 13 Sep 275760)
        if (newTime.isValid() && !isNaN(newTime.toDate().getTime())) {
            this.props.onUpdate(newTime.toISOString());
        }
    };

    onChange = (key, value, parseValue = val => val) => {
        if (value !== "") {
            const currentTime = moment(this.props.date).utc();
            const newTime = currentTime[key === "day" ? "date" : key]
                && moment(currentTime)[key === "day" ? "date" : key](parseValue(value));
            // check validity of date. this can become NaN when time exceeds max time (+/-864e13 milliseconds -- from Apr 20 -271821 to 13 Sep 275760)
            if (newTime.isValid() && !isNaN(newTime.toDate().getTime())) {
                this.props.onUpdate(newTime.toISOString());
            }
        }
    };

    getForm = () => {

        const currentTime = this.props.date && moment(this.props.date).utc();

        return [
            {
                name: 'icon',
                value: 'calendar',
                type: 'icon'
            },
            {
                name: 'day',
                placeholder: 'DD',
                value: currentTime && currentTime.date()
            },
            {
                name: 'month',
                placeholder: 'MM',
                readOnly: true,
                value: currentTime && currentTime.month(),
                format: value => !isNil(value) && value !== '' && moment.monthsShort(value),
                parseValue: value => value - 1
            },
            {
                name: 'year',
                placeholder: 'YYYY',
                value: currentTime && currentTime.year()
            },
            {
                name: 'icon',
                value: 'time',
                type: 'icon'
            },
            {
                name: 'hours',
                placeholder: 'hh',
                value: currentTime && currentTime.hours()
            },
            {
                name: 'separator',
                value: ':',
                type: 'separator'
            },
            {
                name: 'minutes',
                placeholder: 'mm',
                value: currentTime && currentTime.minutes()
            },
            {
                name: 'separator',
                value: ':',
                type: 'separator'
            },
            {
                name: 'seconds',
                placeholder: 'ss',
                value: currentTime && currentTime.seconds()
            },
            {
                name: 'separator',
                value: currentTime && currentTime.utcOffset(),
                type: 'separator',
                format: value => 'UTC ' + (value >= 0 ? '+' : '-') + padStart(value / 60, 2, 0)
            }
        ];
    };

    render() {
        const formStructure = this.getForm();
        return (
            <Form className={`ms-inline-datetime ${this.props.className}`} style={this.props.style}>
                <FormGroup controlId="inlineDateTime">
                    {this.props.glyph &&
                        <div style={this.props.clickable ? { "cursor": "pointer" } : {}} onClick={() => this.props.clickable && this.props.onIconClick(this.props.date, this.props.glyph) }>
                            <Glyphicon
                                tooltip={this.props.clickable ? this.props.tooltip : undefined}
                                tooltipId={this.props.clickable ? this.props.tooltipId : undefined}
                                className="ms-inline-datetime-icon"
                                glyph={this.props.glyph}/>
                        </div>
                    }
                    {formStructure.map(el =>
                        el.type === 'icon' &&
                        <div
                            className={`ms-inline-datetime-input ms-dt-${el.name}`}>
                            <Glyphicon glyph={el.value}/>
                        </div>
                        ||
                        el.type === 'separator' &&
                        <div
                            className={`ms-inline-datetime-input ms-dt-${el.name}`}>
                            {el.format && el.format(el.value) || el.value}
                        </div>
                        || <div
                            className={`ms-inline-datetime-input ms-dt-${el.name}`}>
                            {this.props.showButtons && <Button
                                bsSize="xs"
                                disabled={!this.props.date}
                                onClick={() => this.onUpdate(el.name, true)}>
                                <Glyphicon glyph="chevron-up"/>
                            </Button>}
                            <FormControl
                                type="text"
                                readOnly={el.readOnly}
                                placeholder={el.placeholder || el.name}
                                disabled={!this.props.date}
                                value={el.format && el.format(el.value) || el.value}
                                onChange={event => this.onChange(el.name, event.target.value, el.parseValue)}/>
                            {this.props.showButtons && <Button
                                bsSize="xs"
                                disabled={!this.props.date}
                                onClick={() => this.onUpdate(el.name)}>
                                <Glyphicon glyph="chevron-down"/>
                            </Button>}
                        </div>

                    )}
                </FormGroup>
            </Form>
        );
    }
}

module.exports = InlineDateTimeSelector;
