import React from 'react';
import TitleEditable from '../../builder/TitleEditable';
import GeneralButton from '../../../misc/GeneralButton';
const {Glyphicon} = require('react-bootstrap');
const enhanceTooltip = require('../../../misc/enhancers/tooltip');
const Glyph = enhanceTooltip(Glyphicon);

const LocationItemEditable = (props) => {
    const {
        locationId,
        locationName,
        onChangeMap,
        onChange,
        currentMapLocation,
        onDeleteFromMap } = props;
    const active = currentMapLocation === locationId;
    return (
        <div
            onClick={() => {
                active
                    ? onChange("currentMapLocation", "")
                    : onChange("currentMapLocation", locationId);
            }}
            className={`ms-geostory-map-locations-item ${active && "ms-geostory-map-locations-item-active"}`}>
            <TitleEditable disabled={!active} title={locationName} onUpdate={(name) => {
                const path = `layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${locationId}"}].properties.locationName`;
                onChangeMap(path, name);
            }} />
            <GeneralButton onClick={() => {
                onChangeMap("currentMapLocation", "");

                // refactor path
                const path = `layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${locationId}"}]`;
                onDeleteFromMap(path);
            }}>
                <Glyph glyph="trash" />
            </GeneralButton>
        </div>
    );
};

export default LocationItemEditable;
