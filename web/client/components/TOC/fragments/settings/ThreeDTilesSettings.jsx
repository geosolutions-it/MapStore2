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
import PointCloudShadingSettings from './PointCloudShadingSettings';
import Select from 'react-select';
import InfoPopover from '../../../widgets/widget/InfoPopover';

/**
 * ThreeDTilesSettings. This component shows the 3d tiles options available
 * @prop {object} layer the layer options
 * @prop {object} onChange callback on every on change event
 */
function ThreeDTilesSettings({
    layer,
    onChange
}) {
    if (layer?.type !== '3dtiles') {
        return null;
    }
    return (
        <div style={{ margin: '0 -8px' }}>
            <FormGroup className="form-group-flex">
                <Checkbox
                    key="enableImageryOverlay"
                    value="enableImageryOverlay"
                    data-qa="3dtiles-enable-imagery-overlay-option"
                    checked={layer.enableImageryOverlay === undefined ? false : layer.enableImageryOverlay}
                    onChange={(e) => onChange("enableImageryOverlay", e.target.checked)}
                >
                    <Message msgId="layerProperties.3dTiles.enableImageryOverlay" /><InfoPopover text={<Message msgId="layerProperties.3dTiles.enableImageryOverlayInfo" />} />
                </Checkbox>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId="layerProperties.3dTiles.format"/></ControlLabel>
                <InputGroup>
                    <Select
                        value={layer.format === 'pnts' ? 'pnts' : '3dmodel'}
                        fallbackValue={0}
                        clearable={false}
                        options={[
                            {
                                value: '3dmodel',
                                label: <Message msgId="layerProperties.3dTiles.3dModel"/>
                            },
                            {
                                value: 'pnts',
                                label: <Message msgId="layerProperties.3dTiles.pointCloud"/>
                            }
                        ]}
                        onChange={(option)=> {
                            onChange('format', option?.value);
                        }}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId="layerProperties.heightOffset"/></ControlLabel>
                <InputGroup style={{ maxWidth: 120 }}>
                    <DebouncedFormControl
                        type="number"
                        name={"heightOffset"}
                        value={layer.heightOffset || 0}
                        fallbackValue={0}
                        onChange={(val)=> {
                            onChange('heightOffset', val !== undefined ? parseFloat(val) : undefined);
                        }}
                    />
                    <InputGroup.Addon>m</InputGroup.Addon>
                </InputGroup>
            </FormGroup>
            <PointCloudShadingSettings
                layer={layer}
                onChange={onChange}
            />
        </div>
    );
}

ThreeDTilesSettings.propTypes = {
    layer: PropTypes.object,
    onChange: PropTypes.func
};

ThreeDTilesSettings.defaultProps = {
    layer: {},
    onChange: () => {}
};

export default ThreeDTilesSettings;
