/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
const {Glyphicon} = require('react-bootstrap');

import SideGrid from '../../../misc/cardgrids/SideGrid';
import Toolbar from '../../../misc/toolbar/Toolbar';
import TitleEditable from '../../builder/TitleEditable';

const LocationList = (props) => {
    const {currentMapLocation, onDeleteFromMap, onChangeMap, onChange, locationFeatures} = props;
    return (
        <div className="ms-geostory-map-locations">
            {locationFeatures.length > 0
                ? (
                    <SideGrid size="sm" items={
                        locationFeatures.map(location => {
                            return {
                                id: location.id,
                                selected: location.id === currentMapLocation,
                                onClick: () => {
                                    location.id === currentMapLocation
                                        ? onChange("currentMapLocation", "")
                                        : onChange("currentMapLocation", location.id);
                                },
                                preview: <Glyphicon glyph="point" />,
                                title: <TitleEditable
                                    title={location.properties.locationName}
                                    disabled={location.id !== currentMapLocation}
                                    onUpdate={(name) => {
                                        const path = `layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${location.id}"}].properties.locationName`;
                                        onChangeMap(path, name);
                                    }} />,
                                tools: <Toolbar
                                    btnDefaultProps={{
                                        className: 'square-button-md no-border'
                                    }}
                                    buttons={[
                                        {
                                            glyph: 'trash',
                                            tooltipId: "delete",

                                            onClick: () => {
                                                onChangeMap("currentMapLocation", "");
                                                const path = `layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${location.id}"}]`;
                                                onDeleteFromMap(path);
                                            }
                                        }]} />
                            };
                        })
                    } />
                )
                : (<span className="ms-geostory-map-locations-item ">No Locations added</span>)
            }
        </div>
    );

};

export default LocationList;
