/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react';
import {Form, FormGroup, ControlLabel} from 'react-bootstrap';
import Message from '../../../I18N/Message';
import Select from "react-select";
import {isNil} from "lodash";
import { applyDefaults } from '../../../../utils/GeoStoryUtils';
import { is3DVisualizationMode } from '../../../../utils/MapTypeUtils';
import { getScales } from '../../../../utils/MapUtils';

import Button from '../../../misc/Button';
import SwitchButton from '../../../misc/switch/SwitchButton';
import localizedProps from '../../../misc/enhancers/localizedProps';
import FeatureInfoFormatSelector from '../../../misc/FeatureInfoFormatSelector';
import CoordinatesEditor from './CoordinatesEditor';

const SelectLocalized = localizedProps(["placeholder", "options"])(Select);

export const Controls = ({
    map = {zoomControl: true, mapInfoControl: false},
    onChangeMap = () => { },
    onApplyToMaps = () => {},
    ...props
} = {}) => {
    const mapOptions = map && map.mapOptions || {};
    const options = applyDefaults({
        mapOptions,
        zoomControl: !isNil(map.zoomControl) ? map.zoomControl : true,
        mapInfoControl: !isNil(map.mapInfoControl) ? map.mapInfoControl : false
    });
    const is3D = is3DVisualizationMode(map);
    const projection = map.projection || 'EPSG:3857';
    const scales = useMemo(() =>
        getScales(projection).map((scale, idx) => ({
            value: idx,
            label: `1 : ${Math.round(scale)}`,
            scale: Math.round(scale)
        })), [projection]);
    const center = map.center || {};
    const zoom = map.zoom;
    const currentZoom = zoom !== undefined ? Math.round(zoom) : 0;

    return (<Form className="ms-geostory-map-controls">
        {!props.isCarouselSection && <FormGroup>
            <div className="ms-geostory-map-controls-center">
                <ControlLabel><Message msgId="geostory.mapEditor.center"/></ControlLabel>
                <Button
                    bsSize="sm"
                    onClick={() => onApplyToMaps('center', center)}
                >
                    <Message msgId="geostory.mapEditor.applyToOtherMaps" />
                </Button>
            </div>
            <CoordinatesEditor
                center={center}
                onChange={(newCenter) => onChangeMap("center", newCenter, "replace")}
            />
        </FormGroup>}
        <FormGroup>
            <div className="ms-geostory-map-controls-scale">
                <ControlLabel><Message msgId="geostory.mapEditor.scale"/></ControlLabel>
                <Button
                    bsSize="sm"
                    onClick={() => onApplyToMaps('zoom', zoom)}
                >
                    <Message msgId="geostory.mapEditor.applyToOtherMaps" />
                </Button>
            </div>
            <Select
                clearable={false}
                value={currentZoom}
                options={scales}
                onChange={(option) => {
                    if (option) {
                        onChangeMap("zoom", option.value, "replace");
                    }
                }}
            />
        </FormGroup>
        {!is3D && <FormGroup>
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
                wrapperStyle = {{ marginTop: "10px"}}
                value={options.mapOptions && options.mapOptions.zoomPosition || "topLeft"}
                clearable={false}
                disabled={!options.zoomControl}
                onChange={(val) => onChangeMap("mapOptions.zoomPosition", val && val.value ? val.value : "topLeft")}
                placeholder="geostory.builder.settings.titlePlaceholder"
            />
        </FormGroup>}
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
        {!is3D && <FormGroup>
            <ControlLabel><Message msgId="geostory.mapEditor.identify"/></ControlLabel>
            <SwitchButton
                onChange={() => {
                    let newMapInfoStatus = !options.mapInfoControl;
                    onChangeMap("mapInfoControl", newMapInfoStatus);
                }}
                className="ms-geostory-map-controls-switch"
                checked={options.mapInfoControl}
            />
            {options.mapInfoControl && !props.hideIdentifyOptions && <FeatureInfoFormatSelector
                disabled={!options.mapInfoControl}
                popoverMessage="geostory.builder.settings.templateTooltip"
                infoFormat={options.mapOptions && options.mapOptions.mapInfoFormat || "application/json"}
                onInfoFormatChange={(format) => onChangeMap("mapOptions.mapInfoFormat", format)}
                selectProps={{
                    wrapperStyle: { marginTop: 10 }
                }}/>}
        </FormGroup>}
    </Form>);
};

export default Controls;
