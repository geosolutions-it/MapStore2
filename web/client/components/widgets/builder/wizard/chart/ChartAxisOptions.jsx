/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import { isNil, castArray } from 'lodash';
import uuidv1 from "uuid/v1";
import Select from 'react-select';
import { FormGroup, Radio, ControlLabel, InputGroup, Checkbox, Button as ButtonRB, Glyphicon, FormControl } from 'react-bootstrap';

import ChartValueFormatting from './ChartValueFormatting';
import Message from '../../../../I18N/Message';
import Font from '../common/Font';
import InfoPopover from '../../../widget/InfoPopover';
import tooltip from '../../../../misc/enhancers/tooltip';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import DebouncedFormControl from '../../../../misc/DebouncedFormControl';
import { FONT } from '../../../../../utils/WidgetsUtils';
import ShapeStyle from './ShapeStyle';

const Button = tooltip(ButtonRB);
const AxisTypeSelect = localizedProps('options')(Select);

const AXIS_TYPES = [{
    value: '-',
    label: 'widgets.advanced.axisTypes.auto'
}, {
    value: 'linear',
    label: 'widgets.advanced.axisTypes.linear'
}, {
    value: 'category',
    label: 'widgets.advanced.axisTypes.category'
}, {
    value: 'log',
    label: 'widgets.advanced.axisTypes.log'
}, {
    value: 'date',
    label: 'widgets.advanced.axisTypes.date'
}];

const MAX_X_AXIS_LABELS = 200;
const getSelectedAxisId = ({
    axisKey,
    chart = {}
}) => {
    const axisOpts = castArray(chart?.[`${axisKey}AxisOpts`] || { id: 0 });
    const selectedAxisId = chart[`${axisKey}axis`] || 0;
    return axisOpts.some(opts => opts.id === selectedAxisId) ? selectedAxisId : 0;
};

const AxisSelector = ({
    chart,
    onChange = () => {},
    onSelect = () => {},
    axisKey = 'x',
    selectedAxisId,
    defaultAddOptions
}) => {
    const [editTitle, setEditTitle] = useState(false);
    const axisOptsKey = `${axisKey}AxisOpts`;
    const traceAxisKey = `${axisKey}axis`;
    const axisOpts = castArray(chart?.[axisOptsKey] || { id: 0 });
    const options = axisOpts.find(({ id }) => id === selectedAxisId) || {};
    return (
        <FormGroup className="form-group-flex">
            <InputGroup>
                {editTitle
                    ? <DebouncedFormControl
                        value={options?.title || ''}
                        onChange={(value) => {
                            const newOptions = axisOpts
                                .map((axis) => axis.id === selectedAxisId ? { ...axis, title: value } : axis);
                            onChange(`charts[${chart?.chartId}].${axisOptsKey}`, newOptions);
                        }}
                    />
                    : <Select
                        clearable={false}
                        disabled={axisOpts.length === 1}
                        value={selectedAxisId}
                        options={axisOpts.map((axisOptions, idx) => ({
                            value: axisOptions.id,
                            label: `[ ${axisKey.toUpperCase()} ${idx} ] ${axisOptions.title || ''}`
                        }))}
                        onChange={(option) => {
                            onSelect(traceAxisKey, option?.value);
                        }}
                    />}
                <InputGroup.Button>
                    <Button
                        bsStyle="primary"
                        onClick={() => setEditTitle(!editTitle)}
                        tooltipId="widgets.builder.editAxisTitle"
                    >
                        <Glyphicon glyph={editTitle ? 'ok' : 'pencil'}/>
                    </Button>
                </InputGroup.Button>
                <InputGroup.Button>
                    <Button
                        bsStyle="primary"
                        disabled={axisOpts.length >= chart?.traces?.length}
                        tooltipId="widgets.builder.addNewAxis"
                        onClick={() => {
                            const newAxis = {
                                ...defaultAddOptions,
                                id: uuidv1()
                            };
                            onChange(`charts[${chart?.chartId}].${axisOptsKey}`, [...axisOpts, newAxis]);
                            onSelect(traceAxisKey, newAxis.id);
                        }}
                    >
                        <Glyphicon glyph="plus"/>
                    </Button>
                </InputGroup.Button>
                <InputGroup.Button>
                    <Button
                        bsStyle="primary"
                        disabled={selectedAxisId === 0}
                        tooltipId="widgets.builder.removeAxis"
                        onClick={() => {
                            const newOptions = axisOpts.filter((axis) => axis.id !== selectedAxisId);
                            onChange(`charts[${chart?.chartId}].${axisOptsKey}`, newOptions);
                            onSelect(traceAxisKey, 0);
                        }}
                    >
                        <Glyphicon glyph="trash"/>
                    </Button>
                </InputGroup.Button>
            </InputGroup>
        </FormGroup>
    );
};

function AxisOptions({
    chart,
    chartPath,
    onChange,
    axisKey = 'y',
    sides = [{ value: 'left', labelId: 'widgets.advanced.left' }, { value: 'right', labelId: 'widgets.advanced.right' }],
    anchors = [{ value: 'y', label: 'Y' }, { value: 'free', labelId: 'widgets.advanced.free' }],
    hideForceTicksOption,
    hideValueFormatting,
    defaultAddOptions
}) {
    const axisOptsKey = `${axisKey}AxisOpts`;
    const axisOpts = castArray(chart?.[axisOptsKey] || { id: 0 });
    const selectedAxisId = getSelectedAxisId({
        axisKey,
        chart
    });
    const options = axisOpts.find(({ id }) => id === selectedAxisId) || {};
    function handleChange(key, value) {
        const newOptions = axisOpts
            .map((axis) => axis.id === selectedAxisId ? { ...axis, [key]: value } : axis);
        onChange(`${chartPath}.${axisOptsKey}`, newOptions);
    }
    return (
        <>
            <div className="ms-wizard-form-separator">
                <Message msgId={`widgets.advanced.${axisKey}Axis`} />
            </div>
            <AxisSelector
                axisKey={axisKey}
                chart={chart}
                selectedAxisId={selectedAxisId}
                defaultAddOptions={defaultAddOptions}
                onChange={onChange}
                onSelect={(key, value) => {
                    onChange(`${chartPath}.${key}`, value);
                }}
            />
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId={`widgets.advanced.${axisKey}AxisType`} />
                </ControlLabel>
                <InputGroup>
                    <AxisTypeSelect
                        value={options?.type || '-'}
                        disabled={!!options.hide}
                        options={AXIS_TYPES}
                        clearable={false}
                        onChange={(option) => {
                            handleChange('type', option?.value);
                        }}
                    />
                </InputGroup>
            </FormGroup>
            <Font
                color={options?.color || chart?.layout?.color || FONT.COLOR}
                fontSize={options?.fontSize || chart?.layout?.fontSize || FONT.SIZE}
                fontFamily={options?.fontFamily || chart?.layout?.fontFamily || FONT.FAMILY}
                disabled={!!options.hide}
                onChange={handleChange}
            />
            {!hideValueFormatting && <ChartValueFormatting
                options={options}
                hideFormula
                onChange={handleChange}
            />}
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="widgets.advanced.side" />
                </ControlLabel>
                <InputGroup>
                    {sides.map(side => (
                        <Radio
                            key={side.value}
                            disabled={!!options.hide}
                            name={`${axisKey}-axis-side`}
                            value={side.value}
                            checked={(options.side || sides[0].value) === side.value}
                            onChange={(event) => {
                                handleChange('side', event?.target?.value);
                            }}
                            inline>
                            {side.labelId ? <Message msgId={side.labelId}/> : side.label}
                        </Radio>
                    ))}
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="widgets.advanced.anchor" />
                </ControlLabel>
                <InputGroup style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {anchors.map(side => (
                        <Radio
                            disabled={!!options.hide}
                            name={`${axisKey}-axis-anchor`}
                            key={side.value}
                            value={side.value}
                            checked={(options.anchor || anchors[0].value) === side.value}
                            onChange={(event) => {
                                handleChange('anchor', event?.target?.value);
                            }}
                            inline>
                            {side.labelId ? <Message msgId={side.labelId}/> : side.label}
                        </Radio>
                    ))}
                    <DebouncedFormControl
                        type="number"
                        disabled={options.anchor !== 'free' || !!options.hide}
                        value={options.positionPx || 0}
                        min={0}
                        step={1}
                        fallbackValue={0}
                        style={{ maxWidth: 65, marginLeft: 'auto', zIndex: 0 }}
                        onChange={(value) => {
                            handleChange('positionPx', value);
                        }}
                    />
                    <InputGroup.Addon style={{ width: 'auto', lineHeight: 'normal' }}>
                        px
                    </InputGroup.Addon>
                </InputGroup>
            </FormGroup>
            {!hideForceTicksOption && <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                <Checkbox
                    disabled={options?.hide ?? false}
                    checked={!!options?.nTicks}
                    onChange={(event) => { handleChange('nTicks', event?.target?.checked ? MAX_X_AXIS_LABELS : undefined); }}
                >
                    <Message msgId="widgets.advanced.forceTicks" /> {' '}
                    {!(options?.hide ?? false) && <InfoPopover bsStyle="info" text={<Message msgId="widgets.advanced.maxXAxisLabels" msgParams={{ max: MAX_X_AXIS_LABELS }} />} />}
                </Checkbox>
            </FormGroup>}
            <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                <Checkbox
                    disabled={options?.hide ?? false}
                    checked={options.angle !== undefined}
                    onChange={(event) => { handleChange('angle', !event?.target?.checked ? undefined : 0); }}
                    style={{ flex: 'unset', marginRight: 8 }}
                >
                    <Message msgId="widgets.advanced.xAxisAngle" />
                </Checkbox>
                <InputGroup style={{ maxWidth: 80 }}>
                    {options.angle !== undefined
                        ? <DebouncedFormControl
                            type="number"
                            min={-90}
                            max={90}
                            fallbackValue={0}
                            disabled={!!options?.hide}
                            value={!isNil(options.angle) ? options.angle : 0}
                            onChange={(value) => handleChange('angle', parseInt(value || 0, 10))}
                        />
                        : <FormControl disabled value={'Auto'} />}
                    <InputGroup.Addon>°</InputGroup.Addon>
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                <Checkbox
                    checked={options?.hide ?? false}
                    onChange={(event) => { handleChange('hide', event?.target?.checked); }}
                >
                    <Message msgId="widgets.advanced.hideLabels" />
                </Checkbox>
            </FormGroup>
            {options.type === 'date' && <FormGroup className="form-group-flex">
                <Checkbox
                    checked={options?.showCurrentTime ?? false}
                    onChange={(event) => { handleChange('showCurrentTime', event?.target?.checked); }}
                >
                    <Message msgId="widgets.advanced.showCurrentTime" />
                </Checkbox>
            </FormGroup>}
            {options.type === 'date' && options.showCurrentTime && (
                <ShapeStyle
                    color={options?.currentTimeShape?.color}
                    size={options?.currentTimeShape?.size}
                    style={options?.currentTimeShape?.style}
                    onChange={(key, value) => handleChange('currentTimeShape', { ...options.currentTimeShape, [key]: value })}
                />
            )}
        </>
    );
}
/**
 * ChartAxisOptions. A component that renders fields to change the chart x/y axis options
 * @prop {object} data the widget chart data
 * @prop {function} onChange callback on every input change
 */
function ChartAxisOptions({
    data = {},
    onChange
}) {
    const selectedChart = (data?.charts || []).find((chart) => chart.chartId === data.selectedChartId);
    const chartPath = `charts[${selectedChart?.chartId}]`;
    return (
        <>
            <AxisOptions
                key={`y-axis-${selectedChart?.chartId}`}
                chart={selectedChart}
                chartPath={chartPath}
                onChange={onChange}
                axisKey="y"
                sides={[{ value: 'left', labelId: 'widgets.advanced.left' }, { value: 'right', labelId: 'widgets.advanced.right' }]}
                anchors={[{ value: 'x', label: 'X' }, { value: 'free', labelId: 'widgets.advanced.free' }]}
                hideForceTicksOption
                hideValueFormatting={false}
                defaultAddOptions={{
                    side: 'right'
                }}
            />
            <AxisOptions
                key={`x-axis-${selectedChart?.chartId}`}
                chart={selectedChart}
                chartPath={chartPath}
                onChange={onChange}
                axisKey="x"
                sides={[{ value: 'bottom', labelId: 'widgets.advanced.bottom' }, { value: 'top', labelId: 'widgets.advanced.top' }]}
                anchors={[{ value: 'y', label: 'Y' }, { value: 'free', labelId: 'widgets.advanced.free' }]}
                hideForceTicksOption={false}
                hideValueFormatting
            />
        </>
    );
}

export default ChartAxisOptions;
