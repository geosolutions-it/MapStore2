
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
        onUpdate: PropTypes.func,
        glyph: PropTypes.string,
        style: PropTypes.object,
        className: PropTypes.string,
        tooltip: PropTypes.string,
        tooltipId: PropTypes.string
    };

    static defaultProps = {
        date: '',
        onUpdate: () => {},
        glyph: 'time',
        style: {},
        className: '',
        tooltip: ''
    };

    onUpdate = (key, add) => {
        const currentTime = moment(this.props.date).utc();
        const newTime = add ? moment(currentTime).add(1, key) : moment(currentTime).subtract(1, key);
        this.props.onUpdate(newTime.toISOString());
    };

    onChange = (key, value, parseValue = val => val) => {
        const currentTime = moment(this.props.date).utc();
        const newTime = currentTime[key] && currentTime[key](parseValue(value));
        this.props.onUpdate(newTime.toISOString());
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
                value: currentTime && currentTime.date()
            },
            {
                name: 'month',
                value: currentTime && currentTime.month(),
                format: value => !isNil(value) && moment.monthsShort(value),
                parseValue: value => value - 1
            },
            {
                name: 'year',
                value: currentTime && currentTime.year()
            },
            {
                name: 'icon',
                value: 'time',
                type: 'icon'
            },
            {
                name: 'hours',
                value: currentTime && currentTime.hours()
            },
            {
                name: 'separator',
                value: ':',
                type: 'separator'
            },
            {
                name: 'minutes',
                value: currentTime && currentTime.minutes()
            },
            {
                name: 'separator',
                value: ':',
                type: 'separator'
            },
            {
                name: 'seconds',
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
                    {this.props.glyph && <Glyphicon
                        tooltip={this.props.tooltip}
                        tooltipId={this.props.tooltipId}
                        className="ms-inline-datetime-icon"
                        glyph={this.props.glyph}/>}
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
                            <Button
                                bsSize="xs"
                                disabled={!this.props.date}
                                onClick={() => this.onUpdate(el.name, true)}>
                                <Glyphicon glyph="chevron-up"/>
                            </Button>
                            <FormControl
                                type="text"
                                placeholder={el.name}
                                disabled={!this.props.date}
                                value={el.format && el.format(el.value) || el.value}
                                onChange={event => this.onChange(el.name, event.target.value, el.parseValue)}/>
                            <Button
                                bsSize="xs"
                                disabled={!this.props.date}
                                onClick={() => this.onUpdate(el.name)}>
                                <Glyphicon glyph="chevron-down"/>
                            </Button>
                        </div>

                    )}
                </FormGroup>
            </Form>
        );
    }
}

module.exports = InlineDateTimeSelector;
