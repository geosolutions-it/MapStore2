/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Alert } from 'react-bootstrap';
import isNaN from 'lodash/isNaN';
import isNil from 'lodash/isNil';
import Select from 'react-select';
import localizedProps from '../../../misc/enhancers/localizedProps';
import Toolbar from '../../../misc/toolbar/Toolbar';
import SwitchButton from '../../../misc/switch/SwitchButton';
import { getLayerCapabilities } from '../../../../observables/wms';
import Message from '../../../I18N/Message';
import {
    getResolutions,
    getZoomFromResolution,
    dpi2dpu,
    DEFAULT_SCREEN_DPI
} from '../../../../utils/MapUtils';

const ReactSelectCreatable = localizedProps(['placeholder', 'noResultsText'])(Select.Creatable);
const ReactSelect = localizedProps(['placeholder', 'noResultsText'])(Select);

function formatLabel(value, type) {
    if (type === 'scale') {
        return '1 : ' + Math.round(value);
    }
    return value;
}

function FieldRenderer({ label, showArrow, limitsType }) {
    return <span>{formatLabel(label, limitsType)}{showArrow && <>&nbsp;<Glyphicon glyph="arrow-left"/></>}</span>;
}

function SelectInput({
    id,
    value,
    placeholderId,
    noResultsTextId,
    createTextId,
    options,
    isValidNewOption = () => true,
    onChange = () => {},
    disabled,
    loading
}) {
    return (
        <ReactSelectCreatable
            inputProps={{ id }}
            placeholder={placeholderId}
            noResultsText={noResultsTextId}
            value={value}
            isLoading={loading}
            options={options}
            disabled={disabled}
            optionRenderer={FieldRenderer}
            valueRenderer={FieldRenderer}
            promptTextCreator={(label) => {
                return <Message msgId={createTextId} msgParams={{ label }}/>;
            }}
            isValidNewOption={(option) => {
                if (option.label) {
                    const newValue = parseFloat(option.label);
                    return !isNaN(newValue) && isValidNewOption(newValue);
                }
                return false;
            }}
            onChange={(option) => {
                const newValue = option?.value && parseFloat(option.value);
                onChange(isNaN(newValue) ? undefined : { ...option, value: newValue });
            }}
        />
    );
}
/**
 * Form to set min and max resolutions values from layer object
 * @memberof components.TOC
 * @name VisibilityLimitsForm
 * @class
 * @prop {node|string} title
 * @prop {object} layer
 * @prop {number} zoom
 * @prop {string} projection projection code of the target map
 * @prop {array} resolutions resolutions array of the target map
 * @prop {string} defaultLimitsType default type for visibility limits 'scale' or 'resolution'
 * @prop {number} dpi dpi value of the browser
 * @prop {function} onChange callback triggered after changing the form
 */
function VisibilityLimitsForm({
    title,
    layer,
    zoom,
    projection,
    resolutions = getResolutions(),
    defaultLimitsType,
    limitsTypesOptions,
    dpi,
    onChange
}) {

    const [limitsType, setLimitsType] = useState(defaultLimitsType || limitsTypesOptions[0].value);

    const {
        maxResolution,
        minResolution,
        disableResolutionLimits
    } = layer;

    const dpu = dpi2dpu(dpi, projection);

    function updateOptions(options, newValue) {
        const values = options.map((option) => option[limitsType]);
        const isMissing = !isNil(newValue[limitsType]) && values.indexOf(newValue[limitsType]) === -1;
        return isMissing
            ? [ newValue, ...options].sort((a, b) => a[limitsType] > b[limitsType] ? -1 : 1)
            : options;
    }

    function getResolutionObject(value, type) {
        if (type === 'scale') {
            const resolution = value / dpu;
            return {
                resolution: resolution,
                scale: value,
                zoom: getZoomFromResolution(resolution, resolutions)
            };
        }
        return {
            resolution: value,
            scale: value * dpu,
            zoom: getZoomFromResolution(value, resolutions)
        };
    }

    const [options, setOptions] = useState([]);
    const [maxValue, setMaxValue] = useState(maxResolution && {
        resolution: maxResolution,
        scale: maxResolution * dpu,
        zoom: getZoomFromResolution(maxResolution, resolutions)
    });
    const [minValue, setMinValue] = useState(minResolution && {
        resolution: minResolution,
        scale: minResolution * dpu,
        zoom: getZoomFromResolution(minResolution, resolutions)
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState();
    const [error, setError] = useState();
    const isMounted = useRef();

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    function clearAlters() {
        setError(undefined);
        setMessage(undefined);
    }

    function handleGetCapabilities() {
        if (layer.type === 'wms' && !loading) {
            setLoading(true);
            clearAlters();
            getLayerCapabilities(layer)
                .toPromise()
                .then((capabilities) => {
                    if (isMounted.current) {
                        const {
                            maxScaleDenominator,
                            minScaleDenominator
                        } = capabilities;
                        const newMaxValue = !isNil(maxScaleDenominator)
                            && getResolutionObject(maxScaleDenominator, 'scale');
                        const newMinValue = !isNil(minScaleDenominator)
                            && getResolutionObject(minScaleDenominator, 'scale');
                        const newMessageId = isNil(maxScaleDenominator) && isNil(minScaleDenominator)
                            ? 'layerProperties.visibilityLimitsValuesUpdateUndefined'
                            : 'layerProperties.visibilityLimitsValuesUpdate';
                        setMessage(newMessageId);
                        onChange({
                            maxResolution: newMaxValue.resolution,
                            minResolution: newMinValue.resolution
                        });
                        setLoading(false);
                    }
                })
                .catch(() => {
                    if (isMounted.current) {
                        setLoading(false);
                        setError('layerProperties.visibilityLimitsValuesError');
                    }
                });
        }
    }

    useEffect(() => {
        const newMinValue = minResolution && {
            resolution: minResolution,
            scale: minResolution * dpu,
            zoom: getZoomFromResolution(minResolution, resolutions)
        };
        const newMaxValue = maxResolution && {
            resolution: maxResolution,
            scale: maxResolution * dpu,
            zoom: getZoomFromResolution(maxResolution, resolutions)
        };
        const newOptions = [ newMinValue, newMaxValue ]
            .filter(value => value)
            .reduce(
                updateOptions,
                resolutions
                    .map((value, idx) => ({
                        resolution: value,
                        scale: value * dpu,
                        zoom: idx
                    }))
            );
        setMaxValue(newMaxValue);
        setMinValue(newMinValue);
        setOptions(newOptions);
        clearAlters();
    }, [ limitsType, projection ]);

    return (
        <div className="ms-visibility-limits-form">
            <div className="ms-visibility-limits-form-title" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>{title}</div>
                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md no-border'
                    }}
                    buttons={[
                        {
                            glyph: 'refresh',
                            disabled: !!(disableResolutionLimits || loading),
                            visible: layer.type === 'wms',
                            onClick: handleGetCapabilities,
                            tooltipId: 'layerProperties.visibilityLimitsUpdateWMSCapabilities'
                        },
                        {
                            Element: () => <SwitchButton
                                checked={!disableResolutionLimits}
                                onClick={() => {
                                    onChange({
                                        disableResolutionLimits: !disableResolutionLimits
                                    });
                                    clearAlters();
                                }}
                            />
                        }
                    ]}
                />
            </div>
            <label htmlFor="ms-visibility-limits-max">
                <Message msgId="layerProperties.visibilityLimitsMaxValue"/>
            </label>
            <SelectInput
                id="ms-visibility-limits-max"
                value={maxValue?.[limitsType] && {
                    value: maxValue[limitsType],
                    label: maxValue[limitsType],
                    zoom: maxValue.zoom,
                    limitsType
                }}
                placeholderId="layerProperties.visibilityLimitsMaxValuePlaceholder"
                noResultsTextId="layerProperties.visibilityLimitsMaxValueNoResultsText"
                createTextId="layerProperties.visibilityLimitsCreateOption"
                loading={loading}
                isValidNewOption={(newValue) => newValue >= (minValue?.[limitsType] || 0)}
                options={options.map((option) => {
                    return {
                        ...option,
                        value: option[limitsType] + (option.delta || 0),
                        label: option[limitsType],
                        showArrow: option.zoom === zoom,
                        disabled: !isNil(minValue?.[limitsType]) && option[limitsType] <= minValue[limitsType],
                        limitsType
                    };
                })}
                disabled={disableResolutionLimits || loading}
                onChange={(option) => {
                    // created entries do not contain zoom propery
                    const newMaxValue = option.value === undefined
                        ? {}
                        : !isNil(option.zoom)
                            ? {
                                resolution: option.resolution,
                                scale: option.scale,
                                zoom: option.zoom
                            }
                            : getResolutionObject(option.value, limitsType);
                    onChange({
                        maxResolution: newMaxValue.resolution
                    });
                    setMaxValue(newMaxValue);
                    if (option.value !== undefined && isNil(option.zoom)) {
                        const newOptions = updateOptions(options, newMaxValue);
                        setOptions(newOptions);
                    }
                    clearAlters();
                }}
            />
            <label htmlFor="ms-visibility-limits-min"><Message msgId="layerProperties.visibilityLimitsMinValue"/></label>
            <SelectInput
                id="ms-visibility-limits-min"
                value={minValue?.[limitsType] && {
                    value: minValue[limitsType],
                    label: minValue[limitsType],
                    zoom: minValue.zoom,
                    limitsType
                }}
                placeholderId="layerProperties.visibilityLimitsMinValuePlaceholder"
                noResultsTextId="layerProperties.visibilityLimitsMinValueNoResultsText"
                createTextId="layerProperties.visibilityLimitsCreateOption"
                loading={loading}
                isValidNewOption={(newValue) => newValue <= (maxValue?.[limitsType] || Infinity)}
                options={options.map((option) => {
                    return {
                        ...option,
                        value: option[limitsType],
                        label: option[limitsType],
                        showArrow: option.zoom === zoom,
                        disabled: !isNil(maxValue?.[limitsType]) && option[limitsType] >= maxValue[limitsType],
                        limitsType
                    };
                })}
                disabled={disableResolutionLimits || loading}
                onChange={(option) => {
                    // created entries do not contain zoom propery
                    const newMinValue = option.value === undefined
                        ? {}
                        : !isNil(option.zoom)
                            ? {
                                resolution: option.resolution,
                                scale: option.scale,
                                zoom: option.zoom
                            }
                            : getResolutionObject(option.value, limitsType);
                    onChange({
                        minResolution: newMinValue.resolution
                    });
                    setMinValue(newMinValue);
                    if (option.value !== undefined && isNil(option.zoom)) {
                        const newOptions = updateOptions(options, newMinValue);
                        setOptions(newOptions);
                    }
                    clearAlters();
                }}
            />
            <label htmlFor="ms-visibility-limits-type"><Message msgId="layerProperties.visibilityLimitsType"/></label>
            <ReactSelect
                inputProps={{ id: 'ms-visibility-limits-type' }}
                value={limitsType}
                clearable={false}
                options={limitsTypesOptions.map(({ labelId, ...option }) => ({
                    ...option,
                    ...(labelId && { label: <Message msgId={labelId}/> })
                }))}
                disabled={disableResolutionLimits || loading}
                onChange={({ value }) => {
                    setLimitsType(value);
                    clearAlters();
                }}
            />
            {message && <Alert bsStyle="success">
                <Message msgId={message}/>
            </Alert>}
            {error && <Alert bsStyle="danger">
                <Message msgId={error}/>
            </Alert>}
        </div>
    );
}

VisibilityLimitsForm.propTypes = {
    layer: PropTypes.object,
    zoom: PropTypes.number,
    onChange: PropTypes.func,
    resolutions: PropTypes.array,
    limitsTypesOptions: PropTypes.array,
    projection: PropTypes.string,
    dpi: PropTypes.number,
    defaultLimitsType: PropTypes.string
};

VisibilityLimitsForm.defaultProps = {
    layer: {},
    onChange: () => {},
    limitsTypesOptions: [
        { value: 'scale', labelId: 'layerProperties.visibilityLimitsScale' },
        { value: 'resolution', labelId: 'layerProperties.visibilityLimitsResolution' }
    ],
    dpi: DEFAULT_SCREEN_DPI
};

export default VisibilityLimitsForm;
