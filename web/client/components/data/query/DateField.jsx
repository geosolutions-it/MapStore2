/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const moment = require('moment');
const momentLocalizer = require('react-widgets/lib/localizers/moment');

momentLocalizer(moment);

const {DateTimePicker} = require('react-widgets');
const {Row, Col} = require('react-bootstrap');

require('react-widgets/lib/less/react-widgets.less');

class DateField extends React.Component {
    static propTypes = {
        timeEnabled: PropTypes.bool,
        dateFormat: PropTypes.string,
        operator: PropTypes.string,
        fieldName: PropTypes.string,
        fieldRowId: PropTypes.number,
        attType: PropTypes.string,
        fieldValue: PropTypes.object,
        fieldException: PropTypes.string,
        onUpdateField: PropTypes.func,
        onUpdateExceptionField: PropTypes.func
    };

    static defaultProps = {
        timeEnabled: false,
        dateFormat: "DD-MM-YYYY",
        operator: null,
        fieldName: null,
        fieldRowId: null,
        attType: null,
        fieldValue: null,
        fieldException: null,
        onUpdateField: () => {},
        onUpdateExceptionField: () => {}
    };

    getDateStartOfDay = (date) => {
        if (this.props.attType === "date") {

        }
        let month = date.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        let day = date.getDate();
        day = day < 10 ? "0" + day : day;
        return new Date(`${date.getFullYear()}-${month}-${day}T00:00:00Z`);
    }

    getUTCDate = (date) => {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
    }
    render() {
        let startdate = this.props.fieldValue && this.props.fieldValue.startDate ? this.getUTCDate(this.props.fieldValue.startDate) : null;
        let enddate = this.props.fieldValue && this.props.fieldValue.endDate ? this.getUTCDate(this.props.fieldValue.endDate) : null;

        let defaultCurrentDate = moment().startOf("day").toDate();
        defaultCurrentDate = this.getDateStartOfDay(defaultCurrentDate);

        let dateRow = this.props.operator === "><" ?
                (<div>
                    <Row>
                        <Col xs={6}>
                            <DateTimePicker
                                defaultValue={startdate}
                                value={startdate}
                                time={this.props.timeEnabled}
                                format={this.props.dateFormat}
                                onChange={(date) => this.updateValueState({startDate: date, endDate: enddate})}/>
                        </Col>
                        <Col xs={6}>
                            <DateTimePicker
                                defaultValue={enddate}
                                value={enddate}
                                time={this.props.timeEnabled}
                                format={this.props.dateFormat}
                                onChange={(date) => this.updateValueState({startDate: startdate, endDate: date})}/>
                        </Col>
                    </Row>
                </div>)
             :
                (<Row>
                    <Col xs={12}>
                        <DateTimePicker
                            defaultCurrentDate={defaultCurrentDate}
                            defaultValue={startdate}
                            value={startdate}
                            time={this.props.timeEnabled}
                            format={this.props.dateFormat}
                            onChange={
                                (date) => {
                                    console.log(`on change startDate:${date} and getDateStartOfDay ${this.getDateStartOfDay(date)}`);
                                    this.updateValueState({startDate: this.getDateStartOfDay(date), endDate: null});
                                }
                            }/>
                    </Col>
                </Row>)
            ;

        return (
            dateRow
        );
    }

    updateValueState = (value) => {
        if (value.startDate && value.endDate && value.startDate > value.endDate) {
            this.props.onUpdateExceptionField(this.props.fieldRowId, "queryform.attributefilter.datefield.wrong_date_range");
        } else {
            this.props.onUpdateExceptionField(this.props.fieldRowId, null);
        }

        this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, value, this.props.attType);
    };
}

module.exports = DateField;
