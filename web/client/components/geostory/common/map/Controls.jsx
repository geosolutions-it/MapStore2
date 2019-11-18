/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Form, FormGroup, ControlLabel} from 'react-bootstrap';
import Message from '../../../I18N/Message';
import Select from "react-select";
import {isNil} from "lodash";
import { applyDefaults } from '../../../../utils/GeoStoryUtils';

import SwitchButton from '../../../misc/switch/SwitchButton';
import localizedProps from '../../../misc/enhancers/localizedProps';

const SelectLocalized = localizedProps(["placeholder", "options"])(Select);

export const Controls = ({
    map = {zoomControl: true},
    onChangeMap = () => {}
} = {}) => {
    const mapOptions = map && map.mapOptions || {};
    const options = applyDefaults({
        mapOptions,
        zoomControl: !isNil(map.zoomControl) ? map.zoomControl : true
    });
    return (<Form className="ms-geostory-map-controls">
        <FormGroup>
            <ControlLabel><Message msgId="geostory.mapEditor.zoom"/></ControlLabel>
            <SwitchButton
                onChange={() => {
                    let newZoomStatus = !options.zoomControl;
                    onChangeMap("zoomControl", newZoomStatus);
                    onChangeMap("mapOptions.interactions", {
                        doubleClickZoom: newZoomStatus,
                        shiftDragZoom: newZoomStatus,
                        pinchZoom: newZoomStatus
                    });
                }}
                className="ms-geostory-map-controls-switch"
                checked={options.zoomControl}
            />
            <SelectLocalized
                options={[
                    {label: "geostory.mapEditor.topLeft", value: "topLeft"},
                    {label: "geostory.mapEditor.topRight", value: "topRight"},
                    {label: "geostory.mapEditor.bottomLeft", value: "bottomLeft"},
                    {label: "geostory.mapEditor.bottomRight", value: "bottomRight"}
                ]}
                value={options.mapOptions && options.mapOptions.zoomPosition || "topLeft"}
                clearable={false}
                disabled={!options.zoomControl}
                onChange={(val) => onChangeMap("mapOptions.zoomPosition", val && val.value ? val.value : "topLeft")}
                placeholder="geostory.builder.settings.titlePlaceholder"
            />
        </FormGroup>
        <FormGroup>
            <ControlLabel><Message msgId="geostory.mapEditor.pan"/></ControlLabel>
            <SwitchButton
                onChange={() => {
                    const newDragStatus = !(options.mapOptions && options.mapOptions.interactions && options.mapOptions.interactions.dragPan);
                    onChangeMap("mapOptions.interactions", {
                        dragPan: newDragStatus,
                        keyboardPan: newDragStatus
                    });
                }}
                className="ms-geostory-map-controls-switch"
                checked={options.mapOptions && options.mapOptions.interactions && options.mapOptions.interactions.dragPan}
            />
        </FormGroup>
    </Form>);
};

export default Controls;
