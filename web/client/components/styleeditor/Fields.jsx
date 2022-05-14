/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { FormGroup, FormControl as FormControlRB } from 'react-bootstrap';
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
import localizedProps from '../misc/enhancers/localizedProps';
import PropertyField from './PropertyField';
import MarkSelector from './MarkSelector';
import Band from './Band';
import IconInput from './IconInput';
import SelectInput from './SelectInput';

const FormControl = localizedProps('placeholder')(FormControlRB);

export const fields = {
    color: ({
        label,
        config = {},
        value,
        onChange = () => {},
        disableAlpha,
        format
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
                <>
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
                </>
            );
        }

        return (
            <PropertyField
                label={label}>
                <ColorSelector
                    color={value}
                    line={config.stroke}
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
    input: ({ label, value, config = {}, onChange = () => {}, disabled }) => {
        return (
            <PropertyField
                label={label}>
                <FormGroup>
                    <FormControl
                        type={config.type || 'text'}
                        value={value}
                        disabled={disabled}
                        placeholder="styleeditor.placeholderInput"
                        onChange={event => onChange(event.target.value)}/>
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
                        active: optionValue === value ? true : false,
                        onClick: () => onChange(value === optionValue ? undefined : optionValue)
                    }))}/>
        </PropertyField>
    ),
    mark: ({ label, ...props }) => (
        <PropertyField
            label={label}>
            <MarkSelector { ...props }/>
        </PropertyField>
    ),
    image: ({
        label,
        value,
        config: {},
        onChange
    }) => {
        const [error, setError] = useState(false);
        const currentValue = isObject(value)
            ? value.src
            : value;
        return (
            <PropertyField
                label={label}
                invalid={!!(error?.type === 'error')}
                warning={!!(error?.type === 'warning')}>
                <IconInput
                    label={label}
                    value={currentValue}
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
        config: {
            options
        }
    }) => {
        return (
            <PropertyField
                label={label}>
                <DashArray
                    dashArray={value}
                    onChange={onChange}
                    options={options}
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
    config: fieldsConfig,
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

    return <>
        {Object.keys(params)
            .map((keyParam) => {
                const { type, setValue, getValue, isDisabled, config, label, key: keyProperty, isVisible } = params[keyParam] || {};
                const key = keyProperty || keyParam;
                const FieldComponent = fields[type];
                const value = setValue && setValue(properties[key], state.current.properties);
                return FieldComponent && <FieldComponent
                    {...fieldsConfig}
                    key={key}
                    label={label || key}
                    config={config}
                    format={format}
                    visible={isVisible && isVisible(properties[key], state.current.properties, format)}
                    disabled={isDisabled && isDisabled(properties[key], state.current.properties, fieldsConfig)}
                    value={!isNil(value) ? value : properties[key]}
                    onChange={(values) => onChange(getValue && getValue(values, state.current.properties) || values)}/>;
            })}
    </>;
}

export default Fields;

