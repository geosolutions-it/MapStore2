/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';
import { get, find } from 'lodash';
import { InputGroup, FormGroup, FormControl, ControlLabel, Button as ButtonRB, Glyphicon, Checkbox } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { DateTimePicker } from 'react-widgets';

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);

import Message from '../../../../I18N/Message';
import CounterAdvancedOptions from './CounterAdvancedOptions';
import tooltip from '../../../../misc/enhancers/tooltip';
import { dateFormats } from '../../../../../utils/FeatureGridUtils';

const Button = tooltip(ButtonRB);

const getLabelMessageId = (field, data = {}) => `widgets.${field}.${data.type || data.widgetType || "default"}`;

const placeHolder = <Message msgId={getLabelMessageId("placeHolder")} />;

const getDefaultPlaceholderByType = (type) => {
    switch (type) {
    case 'int':
    case 'number':
        return 0;
    case 'date':
        return moment().format(dateFormats.date); // e.g., "2025-10-21Z"
    case 'time':
        return `1970-01-01T${moment().format(dateFormats.time)}`; // e.g., "1970-01-01T14:30:45Z"
    case 'date-time':
        return moment().format(dateFormats['date-time']); // e.g., "2025-10-21T14:30:45Z"
    case 'string':
    case 'boolean':
    default:
        return "NULL";
    }
};

const renderNullPlaceholderInput = (type, value, onChange) => {
    switch (type) {
    case 'int':
        return <FormControl type="number" step={1} value={value ?? "0"} onChange={(e) => onChange("options.placeholderForNullGroupByFieldValue", e.target.value)} />;
    case 'number':
        return <FormControl type="number" value={value ?? "0"} onChange={(e) => onChange("options.placeholderForNullGroupByFieldValue", e.target.value)} />;
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
                onChange("options.placeholderForNullGroupByFieldValue", formatted);
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
                onChange("options.placeholderForNullGroupByFieldValue", formatted);
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
                onChange("options.placeholderForNullGroupByFieldValue", formatted);
            }}
        />);
    }
    case 'string':
    case 'boolean':
    default:
        return <FormControl type="text" value={value ?? "NULL"} onChange={(e) => onChange("options.placeholderForNullGroupByFieldValue", e.target.value)} />;
    }
};

const WPSWidgetOptions = ({
    hasAggregateProcess,
    data = { options: {} },
    onChange = () => { },
    options = [],
    showTitle = true,
    formOptions = {
        showLayer: true,
        showGroupBy: true,
        showUom: false,
        showLegend: true,
        advancedOptions: true
    },
    aggregationOptions = [],
    sampleChart,
    onChangeLayer,
    onFilterLayer = () => {},
    error
}) => {
    // Get the type of the selected groupByAttributes
    const groupByOption = find(options, {value: data?.options?.groupByAttributes});
    const groupByType = groupByOption?.type;

    return (
        <>
            {/* this sticky style helps to keep showing chart when scrolling*/}
            {sampleChart && <div style={{ position: "sticky", top: 0, zIndex: 1}}>
                <div style={{marginBottom: "30px"}}>
                    {sampleChart}
                </div>
            </div>}
            {showTitle && <div className="ms-wizard-form-separator"><Message msgId={`widgets.chartOptionsTitle`} /></div>}
            <div className="chart-options-form">
                {formOptions.showLayer && <FormGroup className="form-group-flex">
                    <ControlLabel>Layer</ControlLabel>
                    <InputGroup style={{ zIndex: 0 }}>
                        <FormControl  value={data?.layer?.title || data?.layer?.name} disabled/>
                        {onChangeLayer && <InputGroup.Button>
                            <Button
                                bsStyle="primary"
                                onClick={() => onChangeLayer()}
                                tooltipId={'widgets.builder.selectLayer'}
                            >
                                <Glyphicon glyph="cog" />
                            </Button>
                        </InputGroup.Button>}
                        <InputGroup.Button>
                            <Button
                                bsStyle={data?.filter ? 'success' : 'primary'}
                                onClick={() => onFilterLayer()}
                                tooltipId={'widgets.builder.filterLayer'}
                            >
                                <Glyphicon glyph="filter" />
                            </Button>
                        </InputGroup.Button>
                    </InputGroup>
                </FormGroup>}
                {formOptions.showGroupBy ? (
                    <FormGroup controlId="groupByAttributes" className="form-group-flex"
                        validationState={error ? 'error' :  !data?.options?.groupByAttributes ? 'warning' : ''}>
                        <ControlLabel>
                            <Message msgId={getLabelMessageId("groupByAttributes", data)} />
                        </ControlLabel>
                        <InputGroup>
                            <Select
                                value={data.options && data.options.groupByAttributes}
                                options={options}
                                placeholder={placeHolder}
                                onChange={(val) => {
                                    onChange("options.groupByAttributes", val && val.value);
                                    // side Effect of groupByAttributes change, reset default Value of placeHolder
                                    setTimeout(() => {
                                        onChange("options.placeholderForNullGroupByFieldValue", getDefaultPlaceholderByType(val?.type));
                                    }, 200);
                                }}
                            />
                        </InputGroup>
                    </FormGroup>) : null}
                <FormGroup controlId="aggregationAttribute" className="form-group-flex"
                    validationState={error ? 'error' :  !data?.options?.aggregationAttribute ? 'warning' : ''}>
                    <ControlLabel>
                        <Message msgId={getLabelMessageId("aggregationAttribute", data)} />
                    </ControlLabel>
                    <InputGroup>
                        <Select
                            value={data.options && data.options.aggregationAttribute}
                            options={options}
                            placeholder={placeHolder}
                            onChange={(val) => {
                                onChange("options.aggregationAttribute", val && val.value);
                            }}
                        />
                    </InputGroup>
                </FormGroup>
                {hasAggregateProcess ? <FormGroup controlId="aggregateFunction" className="form-group-flex"
                    validationState={error ? 'error' :  !data?.options?.aggregateFunction ? 'warning' : ''}>
                    <ControlLabel>
                        <Message msgId={getLabelMessageId("aggregateFunction", data)} />
                    </ControlLabel>
                    <InputGroup>
                        <Select
                            value={data.options && data.options.aggregateFunction}
                            options={aggregationOptions}
                            placeholder={placeHolder}
                            onChange={(val) => { onChange("options.aggregateFunction", val && val.value); }}
                        />
                    </InputGroup>
                </FormGroup> : null}
                {formOptions.showUom ?
                    <FormGroup controlId="uom" className="form-group-flex">
                        <ControlLabel>
                            <Message msgId={getLabelMessageId("uom", data)} />
                        </ControlLabel>
                        <InputGroup>
                            <FormControl value={get(data, `options.seriesOptions[0].uom`)} type="text" onChange={e => onChange("options.seriesOptions.[0].uom", e.target.value)} />
                        </InputGroup>
                    </FormGroup> : null}
                <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                    <Checkbox
                        id="excludeNullGroupByFieldValue"
                        checked={!!data?.options?.excludeNullGroupByFieldValue}
                        onChange={(event) => onChange("options.excludeNullGroupByFieldValue", event?.target?.checked)}
                    >
                        <Message msgId={getLabelMessageId("groupByAttributes", data)}>
                            {(translatedLabel) => (
                                <Message
                                    msgId="widgets.excludeNullGroupByFieldValue"
                                    msgParams={{ groupByAttribute: translatedLabel }}
                                />
                            )}
                        </Message>
                    </Checkbox>
                </FormGroup>
                {!data?.options?.excludeNullGroupByFieldValue && (
                    <>
                        <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                            <Checkbox
                                id="useNullPlaceholderForGroupByFieldValue"
                                checked={!!data?.options?.useNullPlaceholderForGroupByFieldValue}
                                onChange={(event) => {
                                    const isChecked = event?.target?.checked;
                                    onChange("options.useNullPlaceholderForGroupByFieldValue", isChecked);
                                    // Set default placeholder when enabled, clear when disabled
                                    if (isChecked) {
                                        onChange("options.placeholderForNullGroupByFieldValue", getDefaultPlaceholderByType(groupByType));
                                    } else {
                                        onChange("options.placeholderForNullGroupByFieldValue", null);
                                    }
                                }}
                            >
                                <Message msgId={getLabelMessageId("groupByAttributes", data)}>
                                    {(translatedLabel) => (
                                        <Message
                                            msgId="widgets.useNullPlaceholderForGroupByFieldValue"
                                            msgParams={{ groupByAttribute: translatedLabel }}
                                        />
                                    )}
                                </Message>
                            </Checkbox>
                        </FormGroup>
                        {data?.options?.useNullPlaceholderForGroupByFieldValue && (
                            <FormGroup id="placeholderForNullGroupByField" className="form-group-flex ">
                                <InputGroup>
                                    {renderNullPlaceholderInput(groupByType, data?.options?.placeholderForNullGroupByFieldValue, onChange)}
                                </InputGroup>
                            </FormGroup>
                        )}
                    </>
                )}
                {formOptions.advancedOptions && data.widgetType === "counter"
                    ? <CounterAdvancedOptions
                        data={data}
                        onChange={onChange}
                    />
                    : null}
            </div>
        </>
    );
};

WPSWidgetOptions.propTypes = {
    aggregationOptions: PropTypes.array,
    data: PropTypes.object,
    formOptions: PropTypes.object,
    hasAggregateProcess: PropTypes.bool,
    layer: PropTypes.object,
    onChange: PropTypes.func,
    options: PropTypes.array,
    sampleChart: PropTypes.node,
    showTitle: PropTypes.bool
};
export default WPSWidgetOptions;
