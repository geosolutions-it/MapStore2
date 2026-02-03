/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';
import { get } from 'lodash';
import { InputGroup, FormGroup, FormControl, ControlLabel, Button as ButtonRB, Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';

import Message from '../../../../I18N/Message';
import CounterAdvancedOptions from './CounterAdvancedOptions';
import { getDefaultNullPlaceholderForDataType } from '../../../../../utils/WidgetsUtils';
import tooltip from '../../../../misc/enhancers/tooltip';

const Button = tooltip(ButtonRB);

const getLabelMessageId = (field, data = {}) => `widgets.${field}.${data.type || data.widgetType || "default"}`;

const placeHolder = <Message msgId={getLabelMessageId("placeHolder")} />;

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
                                        onChange("options.nullHandling.groupByAttributes.placeholder", getDefaultNullPlaceholderForDataType(val?.type));
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
