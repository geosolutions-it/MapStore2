/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { find } from 'lodash';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { DateTimePicker } from 'react-widgets';
import Select from 'react-select';

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);

import Message from '../../../../I18N/Message';
import HTML from '../../../../I18N/HTML';
import DisposablePopover from '../../../../misc/popover/DisposablePopover';
import { dateFormats } from '../../../../../utils/FeatureGridUtils';
import { getDefaultNullPlaceholderForDataType } from '../../../../../utils/WidgetsUtils';

const getLabelMessageId = (field, data = {}) => `widgets.${field}.${data.type || data.widgetType || "default"}`;

const renderNullPlaceholderInput = (type, value, onChange) => {
    switch (type) {
    case 'int':
        return <input type="number" step={1} value={value ?? "0"} onChange={(e) => onChange("options.nullHandling.groupByAttributes.placeholder", e.target.value)} className="form-control" />;
    case 'number':
        return <input type="number" value={value ?? "0"} onChange={(e) => onChange("options.nullHandling.groupByAttributes.placeholder", e.target.value)} className="form-control" />;
    case 'date': {
        const format = dateFormats.date;
        const dateValue = value && moment(value, format, true).isValid()
            ? moment(value, format).toDate()
            : null;
        return (<DateTimePicker
            calendar
            time={false}
            format={format}
            value={dateValue}
            onChange={(date) => {
                const formatted = date ? moment(date).format(format) : moment().format(format);
                onChange("options.nullHandling.groupByAttributes.placeholder", formatted);
            }}
        />);
    }
    case 'time': {
        const format = dateFormats.time; // 'HH:mm:ss[Z]'
        // Parse existing value - handles both "HH:mm:ssZ" and "1970-01-01THH:mm:ssZ" formats
        const timeValue = value ? (() => {
            // If value is in ISO format with date prefix, extract just the time part
            if (value.includes('T')) {
                const timePart = value.split('T')[1]; // Extract "21:00:00Z" from "1970-01-01T21:00:00Z"
                return moment(timePart, format, true).isValid()
                    ? moment(timePart, format).toDate()
                    : null;
            }
            // Otherwise parse as time format only
            return moment(value, format, true).isValid()
                ? moment(value, format).toDate()
                : null;
        })() : null;
        return (<DateTimePicker
            calendar={false}
            time
            format={format}
            value={timeValue}
            onChange={(date) => {
                // Format as ISO with 1970-01-01 date prefix to match data format
                const formatted = date
                    ? `1970-01-01T${moment(date).format(dateFormats.time)}`
                    : `1970-01-01T${moment().format(dateFormats.time)}`;
                onChange("options.nullHandling.groupByAttributes.placeholder", formatted);
            }}
        />);
    }
    case 'date-time': {
        const format = dateFormats['date-time'];
        const dateTimeValue = value && moment(value, format, true).isValid()
            ? moment(value, format).toDate()
            : null;
        return (<DateTimePicker
            calendar
            time
            format={format}
            value={dateTimeValue}
            onChange={(date) => {
                const formatted = date ? moment(date).format(format) : moment().format(format);
                onChange("options.nullHandling.groupByAttributes.placeholder", formatted);
            }}
        />);
    }
    case 'string':
    case 'boolean':
    default:
        return <input type="text" value={value ?? "NULL"} onChange={(e) => onChange("options.nullHandling.groupByAttributes.placeholder", e.target.value)} className="form-control" />;
    }
};

const NullManagement = ({
    data = { options: {} },
    onChange = () => { },
    options: groupByFieldOptions = []
}) => {
    // Get the type of the selected groupByAttributes
    const groupByOption = find(groupByFieldOptions, {value: data?.options?.groupByAttributes});
    const groupByType = groupByOption?.type;

    // Get current strategy, default to "default" if not set
    const currentStrategy = data?.options?.nullHandling?.groupByAttributes?.strategy || "default";

    const strategyOptions = [
        { value: "default", label: <Message msgId="widgets.advanced.nullHandlingStrategyDefault" /> },
        { value: "exclude", label: <Message msgId="widgets.advanced.nullHandlingStrategyExclude" /> },
        { value: "placeholder", label: <Message msgId="widgets.advanced.nullHandlingStrategyPlaceholder" /> }
    ];

    const handleStrategyChange = (option) => {
        const newStrategy = option?.value;
        onChange("options.nullHandling.groupByAttributes.strategy", newStrategy);

        // If switching to placeholder strategy, set default placeholder value
        if (newStrategy === "placeholder") {
            onChange("options.nullHandling.groupByAttributes.placeholder", getDefaultNullPlaceholderForDataType(groupByType));
        } else {
            // Clear placeholder if not using placeholder strategy
            onChange("options.nullHandling.groupByAttributes.placeholder", null);
        }
    };

    return (
        <>
            <div className="ms-wizard-form-separator">
                <Message msgId="widgets.advanced.nullManagement" />
            </div>
            <div className="ms-wizard-form-caption">
                <Message msgId={getLabelMessageId("groupByAttributes", data)}>
                    {(translatedLabel) => (

                        <Message
                            msgId="widgets.advanced.groupByNullHandlingStrategyTitle"
                            msgParams={{ groupByAttribute: translatedLabel }}
                        />
                    )}
                </Message>
            </div>
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="widgets.advanced.nullHandlingStrategy" />{' '}
                    <DisposablePopover
                        placement="top"
                        title={<Message msgId="widgets.advanced.nullHandlingStrategy" />}
                        text={<HTML msgId="widgets.advanced.nullHandlingStrategyHelp" />}
                    />
                </ControlLabel>
                <InputGroup>
                    <Select
                        clearable={false}
                        value={strategyOptions.find(option => option.value === currentStrategy)}
                        onChange={handleStrategyChange}
                        options={strategyOptions}
                    />
                </InputGroup>
            </FormGroup>
            {currentStrategy === "placeholder" && (
                <FormGroup id="placeholderForNullGroupByField" className="form-group-flex">
                    <ControlLabel>
                        <Message msgId="widgets.advanced.nullHandlingPlaceholder" />
                    </ControlLabel>
                    <InputGroup>
                        {renderNullPlaceholderInput(
                            groupByType,
                            data?.options?.nullHandling?.groupByAttributes?.placeholder,
                            onChange
                        )}
                    </InputGroup>
                </FormGroup>
            )}
        </>
    );
};

NullManagement.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
    options: PropTypes.array
};

export default NullManagement;

