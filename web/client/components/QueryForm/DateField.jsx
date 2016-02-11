/**
 * Copyright 2015, GeoSolutions Sas.
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
const {Row, Col, Modal, Button} = require('react-bootstrap');

const I18N = require('../I18N/I18N');

require('react-widgets/lib/less/react-widgets.less');

const DateField = React.createClass({
    propTypes: {
        timeEnabled: React.PropTypes.bool,
        dateFormat: React.PropTypes.string,
        operator: React.PropTypes.string,
        fieldName: React.PropTypes.string,
        fieldRowId: React.PropTypes.number,
        fieldValue: React.PropTypes.object,
        fieldException: React.PropTypes.string,
        onUpdateField: React.PropTypes.func,
        onUpdateExceptionField: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            timeEnabled: false,
            dateFormat: "L",
            operator: null,
            fieldName: null,
            fieldRowId: null,
            fieldValue: null,
            fieldException: null,
            onUpdateField: () => {},
            onUpdateExceptionField: () => {}
        };
    },
    render() {
        let dateRow = this.props.operator === "><" ? (
                <div>
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
                    <Modal show={this.props.fieldException ? true : false} bsSize="small">
                        <Modal.Header closeButton>
                            <Modal.Title>Date Exception</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p><I18N.Message msgId={this.props.fieldException || ""}/></p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button style={{"float": "right"}} onClick={this.cleanFields}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            ) : (
                <Row>
                    <Col xs={12}>
                        <DateTimePicker
                            defaultValue={this.props.fieldValue ? this.props.fieldValue.startDate : null}
                            time={this.props.timeEnabled}
                            format={this.props.dateFormat}
                            onChange={(date) => this.updateValueState({startDate: date, endDate: null})}/>
                    </Col>
                </Row>
            );

        return (
            dateRow
        );
    },
    cleanFields() {
        this.props.onUpdateExceptionField(this.props.fieldRowId, null);
    },
    updateValueState(value) {
        if (value.startDate && value.endDate && (value.startDate > value.endDate)) {
            this.props.onUpdateExceptionField(this.props.fieldRowId, "queryform.datefield.wrong_date_range");
        }

        this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, value);
    }
});

module.exports = DateField;
