/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, Checkbox } from 'react-bootstrap';
import DebouncedFormControl from '../../../misc/DebouncedFormControl';
import Message from '../../../I18N/Message';
import InfoPopover from '../../../widgets/widget/InfoPopover';

/**
 * PointCloudShadingSettings. This component shows the point cloud shading options available
 * @prop {object} layer the layer options
 * @prop {object} onChange callback on every on change event
 */
function PointCloudShadingSettings({
    layer,
    onChange
}) {
    if (!(layer?.type === '3dtiles' && layer?.format === 'pnts')) {
        return null;
    }
    const { pointCloudShading = {} } = layer || {};
    return (
        <>
            <div style={{ fontWeight: 'bold', padding: 8 }}><Message msgId="layerProperties.3dTiles.pointCloudShading.title"/></div>
            <FormGroup className="form-group-flex">
                <Checkbox
                    checked={!!pointCloudShading.attenuation}
                    onChange={(event) => onChange('pointCloudShading', {
                        ...pointCloudShading,
                        attenuation: event?.target?.checked,
                        maximumAttenuation: pointCloudShading?.maximumAttenuation ?? 4,
                        eyeDomeLighting: pointCloudShading?.eyeDomeLighting ?? true
                    })}
                >
                    <Message msgId="layerProperties.3dTiles.pointCloudShading.attenuation" />
                    {' '}<InfoPopover text={<Message msgId="layerProperties.3dTiles.pointCloudShading.attenuationInfo" />} />
                </Checkbox>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="layerProperties.3dTiles.pointCloudShading.maximumAttenuation" />
                </ControlLabel>
                <InputGroup style={{ maxWidth: 90 }}>
                    <DebouncedFormControl
                        disabled={!pointCloudShading.attenuation}
                        type="number"
                        value={pointCloudShading.maximumAttenuation !== undefined
                            ?  pointCloudShading.maximumAttenuation
                            : 4}
                        min={0}
                        fallbackValue={4}
                        onChange={(value) => {
                            onChange('pointCloudShading', {
                                ...pointCloudShading,
                                maximumAttenuation: value !== undefined ? parseFloat(value) : undefined
                            });
                        }}
                    />
                    <InputGroup.Addon>
                        px
                    </InputGroup.Addon>
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <Checkbox
                    disabled={!pointCloudShading.attenuation}
                    checked={!!pointCloudShading.eyeDomeLighting}
                    onChange={(event) => onChange('pointCloudShading', {
                        ...pointCloudShading,
                        eyeDomeLighting: event?.target?.checked
                    })}
                >
                    <Message msgId="layerProperties.3dTiles.pointCloudShading.eyeDomeLighting" />
                    {' '}<InfoPopover text={<Message msgId="layerProperties.3dTiles.pointCloudShading.eyeDomeLightingInfo" />} />
                </Checkbox>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="layerProperties.3dTiles.pointCloudShading.eyeDomeLightingStrength" />
                </ControlLabel>
                <InputGroup style={{ maxWidth: 90 }}>
                    <DebouncedFormControl
                        disabled={!pointCloudShading.eyeDomeLighting || !pointCloudShading.attenuation}
                        type="number"
                        value={pointCloudShading.eyeDomeLightingStrength !== undefined
                            ?  pointCloudShading.eyeDomeLightingStrength
                            : 1.0}
                        min={0}
                        fallbackValue={1.0}
                        onChange={(value) => onChange('pointCloudShading', {
                            ...pointCloudShading,
                            eyeDomeLightingStrength: value !== undefined ? parseFloat(value) : undefined
                        })}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="layerProperties.3dTiles.pointCloudShading.eyeDomeLightingRadius" />
                </ControlLabel>
                <InputGroup style={{ maxWidth: 90 }}>
                    <DebouncedFormControl
                        disabled={!pointCloudShading.eyeDomeLighting || !pointCloudShading.attenuation}
                        type="number"
                        value={pointCloudShading.eyeDomeLightingRadius !== undefined
                            ?  pointCloudShading.eyeDomeLightingRadius
                            : 1.0}
                        min={0}
                        step={1}
                        fallbackValue={1.0}
                        onChange={(value) => onChange('pointCloudShading', {
                            ...pointCloudShading,
                            eyeDomeLightingRadius: value !== undefined ? parseFloat(value) : undefined
                        })}
                    />
                </InputGroup>
            </FormGroup>
        </>
    );
}

PointCloudShadingSettings.propTypes = {
    layer: PropTypes.object,
    onChange: PropTypes.func
};

PointCloudShadingSettings.defaultProps = {
    layer: {},
    onChange: () => {}
};

export default PointCloudShadingSettings;
