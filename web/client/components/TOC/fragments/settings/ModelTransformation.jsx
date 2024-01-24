
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
    const changeCenterModelHandler = (newCenter) => {
        const newBbox = {
            ...layer?.bbox,
            bounds: {
                minx: newCenter?.[0] - 0.001,
                miny: newCenter?.[1] - 0.001,
                maxx: newCenter?.[0] + 0.001,
                maxy: newCenter?.[1] + 0.001
            }
        };
        onChange('center', newCenter);
        onChange('bbox', newBbox);
    };
    if (layer?.type !== 'model') {
        return null;
    }
    return (
        <div style={{ margin: '0 -8px' }}>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId="layerProperties.modelLayer.modelCenterLng"/></ControlLabel>
                <InputGroup style={{ maxWidth: 210 }}>
                    <DebouncedFormControl
                        type="number"
                        name={"modelCenterLng"}
                        value={layer?.center?.[0] || 0}
                        fallbackValue={0}
                        onChange={(val)=> {
                            const newCenter = [
                                val !== undefined
                                    ? parseFloat(val) : 0,
                                layer?.center?.[1] ?? 0,
                                layer?.center?.[2] ?? 0
                            ];
                            changeCenterModelHandler(newCenter);
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
                        value={layer?.center?.[1] || 0}
                        fallbackValue={0}
                        onChange={(val)=> {
                            const newCenter = [
                                layer?.center?.[0] ?? 0,
                                val !== undefined
                                    ? parseFloat(val) : 0,
                                layer?.center?.[2] ?? 0
                            ];
                            changeCenterModelHandler(newCenter);
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
                        value={layer?.center?.[2] || 0}
                        fallbackValue={0}
                        onChange={(val)=> {
                            const newCenter = [
                                layer?.center?.[0] ?? 0,
                                layer?.center?.[1] ?? 0,
                                val !== undefined
                                    ? parseFloat(val) : 0
                            ];
                            changeCenterModelHandler(newCenter);
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
