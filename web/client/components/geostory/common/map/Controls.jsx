/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React  from 'react';
import {Form, FormGroup, ControlLabel} from 'react-bootstrap';
import Message from '../../../I18N/Message';
import Select from "react-select";
import {isNil} from "lodash";
const {Glyphicon} = require('react-bootstrap');
import uuid from "uuid";
const enhanceTooltip = require('../../../misc/enhancers/tooltip');
import { applyDefaults } from '../../../../utils/GeoStoryUtils';
import { getLayer } from '../../../../utils/LayersUtils';

import SwitchButton from '../../../misc/switch/SwitchButton';
import GeneralButton from '../../../misc/GeneralButton';
import LocationsList from './LocationList';
import localizedProps from '../../../misc/enhancers/localizedProps';
import FeatureInfoFormatSelector from '../../../misc/FeatureInfoFormatSelector';

const Glyph = enhanceTooltip(Glyphicon);

const SelectLocalized = localizedProps(["placeholder", "options"])(Select);

export const Controls = ({
    map = {zoomControl: true, mapInfoControl: false, mapLocationsEnabled: false},
    onChangeMap = () => {},
    onChange = () => {},
    onDeleteFromMap = () => {},
    currentMapLocation
} = {}) => {
    const mapOptions = map && map.mapOptions || {};
    const options = applyDefaults({
        mapOptions,
        zoomControl: !isNil(map.zoomControl) ? map.zoomControl : true,
        mapInfoControl: !isNil(map.mapInfoControl) ? map.mapInfoControl : false,
        mapLocationsEnabled: !isNil(map.mapLocationsEnabled) ? map.mapLocationsEnabled : false
    });

    const locationsLayer = getLayer('locations', map.layers);
    const locationFeatures = locationsLayer && locationsLayer.features[0].features || [];

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
                wrapperStyle = {{ marginTop: "10px"}}
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
        <FormGroup>
            <ControlLabel><Message msgId="geostory.mapEditor.identify"/></ControlLabel>
            <SwitchButton
                onChange={() => {
                    let newMapInfoStatus = !options.mapInfoControl;
                    onChangeMap("mapInfoControl", newMapInfoStatus);
                    onChange("mapInfoControlTrack", newMapInfoStatus);
                }}
                className="ms-geostory-map-controls-switch"
                checked={options.mapInfoControl}
            />
            {options.mapInfoControl && <FeatureInfoFormatSelector
                disabled={!options.mapInfoControl}
                popoverMessage="geostory.builder.settings.templateTooltip"
                infoFormat={options.mapOptions && options.mapOptions.mapInfoFormat || "application/json"}
                onInfoFormatChange={(format) => onChangeMap("mapOptions.mapInfoFormat", format)}
                selectProps={{
                    wrapperStyle: { marginTop: 10 }
                }}/>}
        </FormGroup>
        <FormGroup>
            <ControlLabel><Message msgId="geostory.mapEditor.locations"/></ControlLabel>
            <div className="ms-geostory-map-controls-switch-add">
                {options.mapLocationsEnabled && (
                    <GeneralButton id="add-location" onClick={
                        () => {
                            const id = uuid();
                            const locationFeature = {
                                id,
                                type: "Feature",
                                style: [{
                                    highlight: false,
                                    iconColor: "blue",
                                    iconGlyph: "marker"
                                }],
                                properties: {
                                    canEdit: false,
                                    isValidFeature: true,
                                    html: "",
                                    locationName: "New Location"
                                },
                                geometry: {
                                    type: "Point",
                                    coordinates: []
                                }
                            };
                            onChangeMap('layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features', [locationFeature]);
                            onChange("currentMapLocation", id);

                        }
                    } className="square-button-sm no-border">
                        <Glyph glyph="plus" />
                    </GeneralButton>
                )}
                <SwitchButton
                    onChange={() => {
                        let newMapLocationsEnabledStatus = !options.mapLocationsEnabled;
                        onChangeMap("mapLocationsEnabled", newMapLocationsEnabledStatus);
                    }}
                    checked={options.mapLocationsEnabled}
                />
            </div>
            {options.mapLocationsEnabled &&
            <LocationsList
                currentMapLocation={currentMapLocation}
                onDeleteFromMap={onDeleteFromMap}
                onChangeMap={onChangeMap}
                onChange={onChange}
                locationFeatures={locationFeatures} /> }
        </FormGroup>
    </Form>);
};

export default Controls;
