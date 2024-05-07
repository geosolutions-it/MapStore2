/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { FormGroup, InputGroup, Glyphicon, MenuItem, DropdownButton, Checkbox } from 'react-bootstrap';
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import isNil from 'lodash/isNil';
import isNaN from 'lodash/isNaN';
import Toolbar from '../misc/toolbar/Toolbar';
import ColorSelector from '../style/ColorSelector';
import Slider from '../misc/Slider';
import ColorRamp from './ColorRamp';
import DashArray from '../style/vector/DashArray';
import ThemaClassesEditor from '../style/ThemaClassesEditor';
import Message from '../I18N/Message';
import PropertyField from './PropertyField';
import MarkSelector from './MarkSelector';
import Band from './Band';
import IconInput from './IconInput';
import ModelInput from './ModelInput';
import SelectInput from './SelectInput';
import DebouncedFormControl from '../misc/DebouncedFormControl';
import MarkerIconSelector from './MarkerIconSelector';
import PropertySelector from './PropertySelector';

export const fields = {
    color: ({
        label,
        config = {},
        value,
        onChange = () => {},
        disableAlpha,
        format,
        disabled
    }) => {

        // needed for slider
        // slider use component should update so value inside onChange was never update
        // with a ref we can get the latest update value
        const state = useRef({ value });
        state.current = {
            value
        };

        const key = isObject(value) && value.kind
            ? 'pattern'
            : 'solid';

        if (key === 'pattern') {
            const { params = {} } = config?.getGroupParams(value.kind) || {};
            const blockConfig = config?.getGroupConfig(value.kind) || {};
            const properties = value;
            return (
                <div className="ms-symbolizer-nested-fields">
                    <Fields
                        properties={properties}
                        params={blockConfig.omittedKeys ? omit(params, blockConfig.omittedKeys) : params}
                        config={{
                            disableAlpha: blockConfig.disableAlpha
                        }}
                        onChange={(values) => onChange({ ...state.current.value, ...values })}
                        format={format}
                    />
                    <PropertyField divider/>
                </div>
            );
        }

        return (
            <PropertyField
                label={label}
                disabled={disabled}>
                <ColorSelector
                    color={value}
                    line={config.stroke}
                    disabled={disabled}
                    disableAlpha={config.disableAlpha || disableAlpha}
                    onChangeColor={(color) => color && onChange(color)}/>
            </PropertyField>
        );
    },
    slider: ({
        label,
        value,
        disabled,
        config = {},
        onChange = () => {}
    }) => {
        return (
            <PropertyField
                label={label}
                disabled={disabled}>
                <div
                    className="mapstore-slider with-tooltip"
                    onClick={(e) => { e.stopPropagation(); }}>
                    <Slider
                        start={[value]}
                        disabled={disabled}
                        tooltips={[true]}
                        format={config.format}
                        range={config.range || { min: 0, max: 10 }}
                        onChange={(changedValue) => onChange(changedValue)}/>
                </div>
            </PropertyField>
        );
    },
    xyInput: ({ label, value, config = {}, onChange = () => {}, disabled }) => {
        return (
            <PropertyField
                label={label}
                disabled={disabled}
                valueStyle={{ flexWrap: 'wrap' }}>
                <FormGroup>
                    <InputGroup style={config?.maxWidth ? { maxWidth: config?.maxWidth } : {}}>
                        <InputGroup.Addon style={{ padding: '0.2em' }}>x</InputGroup.Addon>
                        <DebouncedFormControl
                            type="number"
                            value={value[0]}
                            disabled={disabled}
                            min={config.min}
                            max={config.max}
                            fallbackValue={config.fallbackValue[0]}
                            placeholder={config.placeholderId}
                            style={{ zIndex: 0 }}
                            onChange={eventValue => onChange([eventValue, value[1] || config.fallbackValue[1] ])}/>
                        {config.uom && <InputGroup.Addon>
                            {config.uom}
                        </InputGroup.Addon>}
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <InputGroup style={config?.maxWidth ? { maxWidth: config?.maxWidth } : {}}>
                        <InputGroup.Addon style={{ padding: '0.2em' }}>y</InputGroup.Addon>
                        <DebouncedFormControl
                            type="number"
                            value={value[1]}
                            disabled={disabled}
                            min={config.min}
                            max={config.max}
                            fallbackValue={config.fallbackValue[1]}
                            placeholder={config.placeholderId}
                            style={{ zIndex: 0 }}
                            onChange={eventValue => onChange([ value[0] || config.fallbackValue[0], eventValue ])}/>
                        {config.uom && <InputGroup.Addon>
                            {config.uom}
                        </InputGroup.Addon>}
                    </InputGroup>
                </FormGroup>
            </PropertyField>
        );
    },
    input: ({ label, value, config = {}, onChange = () => {}, disabled }) => {
        return (
            <PropertyField
                label={label}
                disabled={disabled}
                infoMessageId={config.infoMessageId}>
                <FormGroup>
                    <InputGroup style={config?.maxWidth ? { maxWidth: config?.maxWidth } : {}}>
                        <DebouncedFormControl
                            type={config.type || 'text'}
                            value={value}
                            disabled={disabled}
                            min={config.min}
                            max={config.max}
                            fallbackValue={config.fallbackValue}
                            placeholder={config.placeholderId}
                            style={{ zIndex: 0 }}
                            onChange={eventValue => onChange(eventValue)}/>
                        {config.uom && <InputGroup.Addon>
                            {config.uom}
                        </InputGroup.Addon>}
                    </InputGroup>
                </FormGroup>
            </PropertyField>
        );
    },
    checkbox: ({ label, value, config = {}, onChange = () => {}, disabled }) => {
        return (
            <PropertyField
                label={label}
                disabled={disabled}
                infoMessageId={config.infoMessageId}>
                <FormGroup>
                    <Checkbox style={{ margin: 0 }} disabled={disabled} checked={!!value} onChange={(event) => onChange(!!event.target.checked)}>
                        <Message msgId={!!value ? 'styleeditor.boolTrue' : 'styleeditor.boolFalse'} />
                    </Checkbox>
                </FormGroup>
            </PropertyField>
        );
    },
    toolbar: ({
        label,
        value,
        onChange = () => {},
        config = {},
        disabled
    }) => (
        <PropertyField
            label={label}
            disabled={disabled}>
            <Toolbar
                btnDefaultProps={{
                    className: 'no-border',
                    bsSize: 'xs'
                }}
                buttons={(config.options || [])
                    .map(({ glyph, label: optionLabel, labelId: optionLabelId, tooltipId, value: optionValue }) => ({
                        glyph,
                        tooltipId,
                        disabled,
                        text: optionLabelId ? <Message msgId={optionLabelId} /> : optionLabel,
                        ...(optionValue === value && { bsStyle: 'primary' }),
                        onClick: () => onChange(value === optionValue ? undefined : optionValue)
                    }))}/>
        </PropertyField>
    ),
    mark: ({ label, disabled, ...props }) => (
        <PropertyField
            label={label}
            disabled={disabled}>
            <MarkSelector { ...props } disabled={disabled}/>
        </PropertyField>
    ),
    image: (props) => {
        const {
            label,
            value,
            config: {},
            onChange
        } = props;
        const [error, setError] = useState(false);
        const isMarkerIcon = isObject(value) && value?.name === 'msMarkerIcon';
        return (
            <PropertyField
                label={label}
                invalid={!!(error?.type === 'error')}
                warning={!!(error?.type === 'warning')}>
                {isMarkerIcon
                    ? <MarkerIconSelector { ...props }/>
                    : <IconInput
                        label={label}
                        value={isObject(value)
                            ? value.src
                            : value}
                        onChange={(newValue) => {
                            onChange(newValue);
                            setError(false);
                        }}
                        onLoad={(err, src) => {
                            setError(err);
                            if (err) {
                                // send the error to VisualStyleEditor component
                                onChange({ src, errorId: err.messageId });
                            }
                        }}
                    />}
            </PropertyField>
        );
    },
    model: ({
        label,
        value,
        onChange,
        disabled
    }) => {
        const [error, setError] = useState(false);
        return (
            <PropertyField
                label={label}
                invalid={error}
                disabled={disabled}
            >
                <ModelInput
                    disabled={disabled}
                    label={label}
                    value={value}
                    onChange={onChange}
                    onError={setError}
                />
            </PropertyField>
        );
    },
    select: (props) => {
        const {
            label,
            value,
            config: {
                isValid
            },
            visible = true
        } = props;
        if (!visible) return null;
        const valid = !isValid || isValid({ value });
        return (
            <PropertyField
                label={label}
                invalid={!valid}>
                <SelectInput
                    {...props}
                />
            </PropertyField>
        );
    },
    colorRamp: ({
        label,
        value,
        config: {
            samples = 5,
            getOptions = () => [],
            rampFunction = ({ colors }) => colors
        },
        onChange,
        ...props
    }) => {
        const options = getOptions(props);
        return (
            <PropertyField
                label={label}>
                <ColorRamp
                    items={options}
                    rampFunction={rampFunction}
                    samples={samples}
                    value={{ name: value }}
                    onChange={ramp => onChange(ramp.name)}
                />
            </PropertyField>
        );
    },
    colorMap: ({
        value,
        onChange
    }) => {
        return (
            <div
                // prevent drag and drop when interacting with property input
                onDragStart={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
                draggable>
                <ThemaClassesEditor
                    classification={value}
                    onUpdateClasses={(classification, type) =>
                        onChange({
                            classification,
                            type
                        })}
                />
            </div>
        );
    },
    channel: ({
        value,
        onChange,
        bands
    }) => {

        const {
            channelSelection
        } = value;

        const channelSelectionType = !channelSelection
            ? 'auto'
            : channelSelection.grayChannel
                ? 'gray'
                : 'rgb';

        const bandOptions = (bands || []).map((band) => ({
            label: band,
            value: band
        }));

        if (channelSelectionType === 'rgb') {

            return Object.keys(channelSelection)
                .map((channelKey) => {
                    const selectedBand = channelSelection[channelKey]?.sourceChannelName;
                    const contrastEnhancement = channelSelection[channelKey]?.contrastEnhancement;
                    return (
                        <>
                            <Band
                                key={channelKey}
                                value={selectedBand}
                                bands={bandOptions}
                                label={'styleeditor.' + channelKey}
                                enhancementType={contrastEnhancement?.enhancementType || 'none'}
                                onChange={(key, newValue) => {
                                    if (key === 'band') {
                                        return onChange({
                                            contrastEnhancement: {},
                                            channelSelection: {
                                                ...value.channelSelection,
                                                [channelKey]: {
                                                    ...value.channelSelection[channelKey],
                                                    sourceChannelName: newValue
                                                }
                                            }
                                        });
                                    }
                                    if (key === 'enhancementType') {
                                        return onChange({
                                            contrastEnhancement: {},
                                            channelSelection: {
                                                ...value.channelSelection,
                                                [channelKey]: {
                                                    ...value.channelSelection[channelKey],
                                                    contrastEnhancement: {
                                                        ...channelSelection[channelKey].contrastEnhancement,
                                                        enhancementType: newValue
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    return null;
                                }}
                            />
                            <PropertyField key={channelKey + '-divider'} divider/>
                        </>
                    );
                });
        }
        const selectedBand = channelSelection?.grayChannel?.sourceChannelName === undefined
            ? 'auto'
            : channelSelection?.grayChannel?.sourceChannelName;

        const contrastEnhancement = channelSelectionType === 'auto'
            ? value.contrastEnhancement
            : channelSelection?.grayChannel?.contrastEnhancement;

        return (
            <Band
                label="styleeditor.grayChannel"
                value={selectedBand}
                bands={[
                    {
                        label: <Message msgId="styleeditor.channelAuto" />,
                        value: 'auto'
                    },
                    ...bandOptions
                ]}
                enhancementType={contrastEnhancement?.enhancementType || 'none'}
                onChange={(key, newValue) => {
                    if (key === 'band') {
                        return onChange(newValue === 'auto'
                            ? {
                                ...value,
                                channelSelection: undefined
                            }
                            : {
                                contrastEnhancement: {},
                                channelSelection: {
                                    grayChannel: {
                                        contrastEnhancement: {},
                                        ...channelSelection?.grayChannel,
                                        sourceChannelName: newValue
                                    }
                                }
                            });
                    }
                    if (key === 'enhancementType') {
                        return onChange(channelSelectionType === 'auto'
                            ? {
                                channelSelection: undefined,
                                contrastEnhancement: {
                                    ...value.contrastEnhancement,
                                    enhancementType: newValue
                                }
                            }
                            : {
                                contrastEnhancement: {},
                                channelSelection: Object.keys(channelSelection)
                                    .reduce((acc, channelKey) => {
                                        return {
                                            ...acc,
                                            [channelKey]: {
                                                ...channelSelection[channelKey],
                                                contrastEnhancement: {
                                                    ...channelSelection[channelKey].contrastEnhancement,
                                                    enhancementType: newValue
                                                }
                                            }
                                        };
                                    }, {})
                            });
                    }
                    return null;
                }}
            />
        );
    },
    dash: ({
        label,
        value,
        onChange,
        lineDashOptions = [
            { value: '0' },
            { value: '1 4' },
            { value: '1 12' },
            { value: '8 8' },
            { value: '8 16' },
            { value: '8 8 1 8' },
            { value: '8 8 1 4 1 8' },
            { value: '10 50 30' },
            { value: '6 6' },
            { value: '20 20' },
            { value: '30 30' }
        ],
        disabled
    }) => {
        return (
            <PropertyField
                label={label}
                disabled={disabled}>
                <DashArray
                    disabled={disabled}
                    dashArray={value}
                    onChange={onChange}
                    options={lineDashOptions}
                    defaultStrokeWidth={2}
                    isValidNewOption={(option) => {
                        if (option.label) {
                            return !option.label.split(' ')
                                .find((entry) => isNaN(parseFloat(entry)));
                        }
                        return false;
                    }}
                    creatable
                />
            </PropertyField>
        );
    },
    customParams: (props) => {
        const {
            label,
            value,
            config: {
                isValid
            },
            thematicCustomParams,
            onChange
        } = props;
        // if there is no params it will be hidden
        if (!(thematicCustomParams?.length)) {
            return null;
        }
        const valid = !isValid || isValid({ value });
        const handleCustomParamChange = (key, selectedVal) => {
            onChange({
                [key]: selectedVal
            });
        };

        return (
            <div style={{ width: '100%' }}>
                <hr />
                <div className="ms-symbolizer-field"><Message msgId={label} /></div>
                <div>
                    {thematicCustomParams?.map(param=> {
                        const currentValue = value ? value[param?.field] : undefined;
                        const valueObj = param?.values?.find(val => val.value === currentValue);
                        return (
                            <PropertyField
                                key={param?.field}
                                label={param?.title || param?.field}
                                invalid={!valid}>
                                <SelectInput
                                    {...props}
                                    value={valueObj?.value
                                        ? { value: valueObj.value, label: valueObj.name ?? valueObj.value }
                                        : currentValue }
                                    onChange={(val)=> handleCustomParamChange(param.field, val)}
                                    config={{...props.config, getOptions: () => {
                                        return param?.values?.map(val => {
                                            return {
                                                value: val.value,
                                                label: val.name
                                            };
                                        });
                                    }}}
                                />
                            </PropertyField>
                        );
                    })}
                </div>
                <hr />
            </div>
        );
    }
};

/**
 * Renders properties of a symbolizer object based on the params object
 * @memberof components.styleeditor
 * @name Fields
 * @class
 * @prop {object} properties values of the style
 * @prop {object} params representation of a symbolizer block
 * @prop {string} params[keyParam].type type of field (eg: color, select, ...)
 * @prop {function} params[keyParam].setValue (optional) transform the value before to be passed to the component
 * @prop {function} params[keyParam].getValue transform the value before to be changed
 * @prop {object} params[keyParam].config specific configuration of the field
 * @prop {string} params[keyParam].label label of the field
 * @prop {string} params[keyParam].key property key
 * @prop {object} config external configuration needed in field (eg: bands, attributes, ...)
 * @prop {object} format parser type 'css' or 'sld'
 * @prop {function} onChange return the changed value
 */
function Fields({
    properties,
    params,
    config: _fieldsConfig,
    onChange,
    format
}) {

    // needed for slider
    // slider use component should update so value inside onChange was never update
    // with a ref we can get the latest update value
    const state = useRef({ properties });
    state.current = {
        properties
    };
    // currently expression are supported only as property selection
    // in future we could extend the UI to support complex expressions
    const { enableFieldExpression, ...fieldsConfig } = _fieldsConfig || {};
    return <>
        {Object.keys(params)
            .map((keyParam) => {
                const { type, setValue, getValue, isDisabled, config, label, key: keyProperty, isVisible, valueType } = params[keyParam] || {};
                const key = keyProperty || keyParam;
                const FieldComponent = fields[type];
                if (!FieldComponent) {
                    return null;
                }
                const hasAttributes = (fieldsConfig?.attributes || []).some((attribute) => attribute.type === valueType);
                const { disablePropertySelection } = config || {};
                const isPropertyField = hasAttributes && !disablePropertySelection && properties[key]?.name === 'property';
                const value = !isPropertyField ? setValue && setValue(properties[key], state.current.properties) : properties[key];
                const Component = isPropertyField ? PropertySelector : FieldComponent;
                const disabled = isDisabled && isDisabled(properties[key], state.current.properties, fieldsConfig);
                const visible = isVisible ? isVisible(properties[key], state.current.properties, format) : true;
                return visible ? (<div className={`ms-symbolizer-field-wrapper ${type ? `ms-symbolizer-type-${type}` : ''}`}>
                    <Component
                        {...fieldsConfig}
                        key={key}
                        fieldKey={key}
                        label={label || key}
                        valueType={valueType}
                        properties={properties}
                        config={config}
                        format={format}
                        visible={visible}
                        disabled={disabled}
                        value={!isNil(value) ? value : properties[key]}
                        onChange={(values) => onChange(isPropertyField
                            ? values
                            : getValue && getValue(values, state.current.properties) || values)}/>
                    {enableFieldExpression && !disablePropertySelection && <DropdownButton
                        className="no-border"
                        noCaret
                        pullRight
                        disabled={disabled}
                        style={{ padding: 0 }}
                        title={<Glyphicon glyph="option-vertical" />}>
                        <MenuItem
                            key="constant"
                            active={!isPropertyField}
                            onClick={() => onChange({ [key]: setValue && setValue(undefined, state.current.properties) })}>
                            <Message msgId="styleeditor.constantValue" />
                        </MenuItem>
                        <MenuItem
                            key="attribute"
                            active={isPropertyField}
                            onClick={() => onChange({ [key]: { name: 'property', args: [] } })}>
                            <Message msgId="styleeditor.propertyValue" />
                        </MenuItem>
                    </DropdownButton>}
                    {enableFieldExpression && disablePropertySelection && <div style={{ width: 14 }} />}
                </div>) : null;
            })}
    </>;
}

export default Fields;

