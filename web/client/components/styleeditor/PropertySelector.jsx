
/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import PropertyField from './PropertyField';
import localizedProps from '../misc/enhancers/localizedProps';
import DebouncedFormControl from '../misc/DebouncedFormControl';

const LocalizedSelect = localizedProps('placeholder')(Select);

const PropertySelector = ({
    label: labelProp,
    attributes,
    value,
    onChange,
    disabled,
    fieldKey,
    config,
    disableAlpha: disableAlphaProp,
    properties,
    valueType
}) => {
    const disableAlpha = !!(disableAlphaProp || config?.disableAlpha);
    const attributesOptions = attributes.map(({ label, attribute, type }) => ({
        label: `${label} {${type}}`,
        value: attribute,
        type
    }));
    return (
        <div className="ms-symbolizer-property-selector" style={{ width: '100%' }}>
            <PropertyField
                disabled={disabled}
                label={labelProp}
                invalid={value?.args?.[0] === undefined}
                infoMessageId={config?.propertySelectorInfoMessageId}>
                <LocalizedSelect
                    value={value?.args?.[0]}
                    placeholder={'styleeditor.selectProperty'}
                    options={attributesOptions.map(({ type, ...option }) => ({ ...option, disabled: valueType !== undefined && type !== valueType }))}
                    onChange={(option) => onChange({
                        [fieldKey]: { name: 'property', args: [option?.value]}
                    })}
                />
            </PropertyField>
            {!disableAlpha && config?.opacityKey && <PropertyField
                label={`${labelProp}Opacity`}
                tools={
                    <DebouncedFormControl
                        type="number"
                        value={properties[config.opacityKey]}
                        disabled={properties?.[config.opacityKey]?.args?.[0] !== undefined}
                        min={0}
                        max={1}
                        step={0.1}
                        fallbackValue={1}
                        style={{ zIndex: 0, maxWidth: 60, height: 36, borderLeft: 'none' }}
                        onChange={eventValue => {
                            onChange({ [config.opacityKey]: eventValue === undefined ? 1 : parseFloat(eventValue) });
                        }}/>
                }>
                <LocalizedSelect
                    value={properties?.[config.opacityKey]?.args?.[0]}
                    placeholder={'styleeditor.selectProperty'}
                    options={attributesOptions.map(({ type, ...option }) => ({ ...option, disabled: type !== 'number' }))}
                    onChange={(option) => onChange({ [config.opacityKey]: option?.value
                        ? { name: 'property', args: [option?.value] }
                        : 1
                    })}
                />
            </PropertyField>}
        </div>
    );
};

PropertySelector.propTypes = {
    label: PropTypes.string,
    attributes: PropTypes.array,
    value: PropTypes.object,
    onChange: PropTypes.func,
    fieldKey: PropTypes.string,
    config: PropTypes.object,
    disableAlpha: PropTypes.bool,
    properties: PropTypes.object,
    valueType: PropTypes.string
};

PropertySelector.defaultProps = {
    attributes: [],
    properties: {}
};

export default PropertySelector;
