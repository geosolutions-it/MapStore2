const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const Moment = require('moment');
const momentLocalizer = require('react-widgets/lib/localizers/moment');

momentLocalizer(Moment);

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
        dateFormat: "L",
        operator: null,
        fieldName: null,
        fieldRowId: null,
        attType: null,
        fieldValue: null,
        fieldException: null,
        onUpdateField: () => {},
        onUpdateExceptionField: () => {}
    };

    render() {
        let dateRow = this.props.operator === "><" ?
                (<div>
                    <Row>
                        <Col xs={6}>
                            <DateTimePicker
                                defaultValue={this.props.fieldValue ? this.props.fieldValue.startDate : null}
                                time={this.props.timeEnabled}
                                format={this.props.dateFormat}
                                onChange={(date) => this.updateValueState({startDate: date, endDate: this.props.fieldValue ? this.props.fieldValue.endDate : null})}/>
                        </Col>
                        <Col xs={6}>
                            <DateTimePicker
                                defaultValue={this.props.fieldValue ? this.props.fieldValue.endDate : null}
                                time={this.props.timeEnabled}
                                format={this.props.dateFormat}
                                onChange={(date) => this.updateValueState({startDate: this.props.fieldValue ? this.props.fieldValue.startDate : null, endDate: date})}/>
                        </Col>
                    </Row>
                </div>)
             :
                (<Row>
                    <Col xs={12}>
                        <DateTimePicker
                            defaultValue={this.props.fieldValue ? this.props.fieldValue.startDate : null}
                            time={this.props.timeEnabled}
                            format={this.props.dateFormat}
                            onChange={(date) => this.updateValueState({startDate: date, endDate: null})}/>
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
