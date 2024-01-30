
/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';
import DebouncedFormControl from '../../../misc/DebouncedFormControl';
import Message from '../../../I18N/Message';

/**
 * ModelTransformation. This component shows the model transformation options available
 * @prop {object} layer the layer options
 * @prop {object} onChange callback on every on change event
 */
function ModelTransformation({
    layer,
    onChange
}) {
    const changeCenterModelHandler = (value) => {
        const feature = layer?.features?.[0];
        const [longitude, latitude, height] = feature?.geometry?.coordinates || [0, 0, 0];
        const updatedCenter = {
            longitude,
            latitude,
            height,
            ...value
        };
        const newBbox = {
            ...layer?.bbox,
            bounds: {
                minx: updatedCenter.longitude - 0.001,
                miny: updatedCenter.latitude - 0.001,
                maxx: updatedCenter.longitude + 0.001,
                maxy: updatedCenter.latitude + 0.001
            }
        };
        onChange('features', [
            {
                properties: {},
                ...feature,
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [
                        updatedCenter.longitude,
                        updatedCenter.latitude,
                        updatedCenter.height
                    ]
                }
            }
        ]);
        onChange('bbox', newBbox);
    };
    if (layer?.type !== 'model') {
        return null;
    }
    const feature = layer?.features?.[0];
    const [longitude, latitude, height] = feature?.geometry?.coordinates || [0, 0, 0];
    return (
        <div style={{ margin: '0 -8px' }}>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId="layerProperties.modelLayer.modelCenterLng"/></ControlLabel>
                <InputGroup style={{ maxWidth: 210 }}>
                    <DebouncedFormControl
                        type="number"
                        name={"modelCenterLng"}
                        value={longitude}
                        fallbackValue={0}
                        onChange={(val)=> {
                            changeCenterModelHandler({
                                longitude: val !== undefined
                                    ? parseFloat(val) : 0
                            });
                        }}
                    />
                    <InputGroup.Addon>DD</InputGroup.Addon>
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId="layerProperties.modelLayer.modelCenterLat"/></ControlLabel>
                <InputGroup style={{ maxWidth: 210 }}>
                    <DebouncedFormControl
                        type="number"
                        name={"modelCenterLat"}
                        value={latitude}
                        fallbackValue={0}
                        onChange={(val)=> {
                            changeCenterModelHandler({
                                latitude: val !== undefined
                                    ? parseFloat(val) : 0
                            });
                        }}
                    />
                    <InputGroup.Addon>DD</InputGroup.Addon>
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId="layerProperties.heightOffset"/></ControlLabel>
                <InputGroup style={{ maxWidth: 120 }}>
                    <DebouncedFormControl
                        type="number"
                        name={"heightOffset"}
                        value={height}
                        fallbackValue={0}
                        onChange={(val)=> {
                            changeCenterModelHandler({
                                height: val !== undefined
                                    ? parseFloat(val) : 0
                            });
                        }}
                    />
                    <InputGroup.Addon>m</InputGroup.Addon>
                </InputGroup>
            </FormGroup>
        </div>
    );
}

ModelTransformation.propTypes = {
    layer: PropTypes.object,
    onChange: PropTypes.func
};

ModelTransformation.defaultProps = {
    layer: {},
    onChange: () => {}
};

export default ModelTransformation;
