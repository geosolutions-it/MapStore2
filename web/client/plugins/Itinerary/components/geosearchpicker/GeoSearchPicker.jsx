/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useEffect } from 'react';
import isNil from 'lodash/isNil';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { Glyphicon } from 'react-bootstrap';

import Waypoint from './Waypoint';
import FlexBox from '../../../../components/layout/FlexBox';
import Button from '../../../../components/misc/Button';
import Message from '../../../../components/I18N/Message';
import draggableContainer from '../../../../components/misc/enhancers/draggableContainer';
import { generateTemplateString } from '../../../../utils/TemplateUtils';
import { WAYPOINT_MARKER_COLORS } from '../../constants';
import { createMarkerSvgDataUrl } from '../../../../utils/StyleUtils';
import { getDefaultWaypoints } from '../../utils/ItineraryUtils';

/**
 * GeoSearchPicker component
 * Allows adding, removing, and sorting waypoints, searching by location name, and selecting locations from the map.
 * @param {Object} props - The component props
 * @param {string} [props.containerId] - The id of the container to use for the draggable waypoints
 * @param {Array} props.waypoints - The waypoints to display
 * @param {number} props.defaultWaypointsLimit - The default allowed waypoints limit
 * @param {Array} props.locations - The locations to display
 * @param {boolean} props.isDraggable - The flag to allow draggable waypoints
 * @param {Array} props.searchResults - The search results from nomatim
 * @param {boolean} props.searchLoading - The flag indicating if the search is loading
 * @param {Function} props.onSetWaypoints - The function to set the waypoints
 * @param {Function} props.onSearchByLocationName - The function to search by location name
 * @param {Function} props.onUpdateLocations - The function to update the locations. Locations are the coordinates of the waypoints
 * @param {Function} props.onToggleCoordinateEditor - The function to toggle the coordinate editor
 * @param {Function} props.onSelectLocationFromMap - The function to select the location from the map
 */
const GeoSearchPicker = draggableContainer(({
    containerId,
    waypoints = [],
    defaultWaypointsLimit,
    displayName = "properties.display_name",
    locations,
    isDraggable,
    searchResults,
    searchLoading,
    onSetWaypoints,
    onSearchByLocationName,
    onUpdateLocations,
    onSelectLocationFromMap,
    onToggleCoordinateEditor
}) => {

    const handleLocationChange = (idx, value) => {
        const newWaypoints = cloneDeep(waypoints);
        newWaypoints[idx] = { ...newWaypoints[idx], value };
        onSetWaypoints(newWaypoints);
    };

    useEffect(() => {
        return () => {
            onSetWaypoints(getDefaultWaypoints());
            onUpdateLocations([]);
            onSearchByLocationName('');
            onSelectLocationFromMap(null);
            onToggleCoordinateEditor([]);
        };
    }, []);

    const handleLocationSelect = (idx, result) => {
        const newWaypoints = cloneDeep(waypoints);
        newWaypoints[idx] = {
            ...newWaypoints[idx],
            value: isNil(result.lat)
                // nominatim result object
                ? get(result, displayName, generateTemplateString(displayName || "")(result))
                : null
        };
        onSetWaypoints(newWaypoints);
        const value = isNil(result.lat) ? result?.properties : result;

        const newLocations = cloneDeep(locations);
        const {lat, lon} = value ?? {};
        if (lat && lon) {
            newLocations[idx] = [Number(lon), Number(lat)];
        }
        onUpdateLocations(newLocations);
    };

    const handleRemoveWaypoint = (idx) => {
        const newWaypoints = cloneDeep(waypoints);
        const newLocations = cloneDeep(locations);
        newWaypoints.splice(idx, 1);
        newLocations.splice(idx, 1);
        onSetWaypoints(newWaypoints);
        onUpdateLocations(newLocations);
    };

    const handleSort = (targetId, currentId) => {
        const newWaypoints = cloneDeep(waypoints);
        const newLocations = cloneDeep(locations);

        // Move waypoint
        const draggedWaypoint = newWaypoints[currentId];
        newWaypoints.splice(currentId, 1);
        newWaypoints.splice(targetId, 0, draggedWaypoint);

        // Move corresponding location
        const draggedLocation = newLocations[currentId];
        newLocations.splice(currentId, 1);
        newLocations.splice(targetId, 0, draggedLocation);

        onSetWaypoints(newWaypoints);
        onUpdateLocations(newLocations);
    };

    const getIconSrc = (index) => {
        if (index === 0) {
            return createMarkerSvgDataUrl(WAYPOINT_MARKER_COLORS.START, 16, null);
        }
        if (index === (waypoints.length - 1)) {
            return createMarkerSvgDataUrl(WAYPOINT_MARKER_COLORS.END, 16, null);
        }
        return createMarkerSvgDataUrl(WAYPOINT_MARKER_COLORS.WAYPOINT, 16, index);
    };

    return (
        <FlexBox column gap="md" className="geosearch-container">
            {waypoints.map((waypoint, idx) => (
                <Waypoint
                    key={`waypoint-${waypoint.id}`}
                    isDraggable={isDraggable}
                    sortId={idx}
                    idx={idx}
                    index={idx}
                    iconSrc={getIconSrc(idx)}
                    displayName={displayName}
                    containerId={containerId || "waypoint-container"}
                    onSort={handleSort}
                    waypoint={waypoint}
                    waypoints={waypoints}
                    locations={locations}
                    searchResults={searchResults}
                    searchLoading={searchLoading}
                    onRemoveWaypoint={handleRemoveWaypoint}
                    onLocationChange={handleLocationChange}
                    onLocationSelect={handleLocationSelect}
                    onSearchByLocationName={onSearchByLocationName}
                    onSelectLocationFromMap={onSelectLocationFromMap}
                    onToggleCoordinateEditor={onToggleCoordinateEditor}
                    onUpdateLocations={onUpdateLocations}
                />
            ))}
            {isDraggable ? (
                <FlexBox centerChildrenVertically gap="sm">
                    <Glyphicon glyph="grab-handle" className="grab-handle" />
                    <FlexBox
                        component={Button}
                        centerChildren
                        classNames={["_relative", "add-waypoint"]}
                        onClick={() => onSetWaypoints([...waypoints, { value: null, id: Date.now() }])}
                        disabled={waypoints.length >= defaultWaypointsLimit}
                    >
                        <Glyphicon glyph="plus" className="add-waypoint-icon"/>
                    </FlexBox>
                    <FlexBox.Fill className="_padding-lr-sm"><Message msgId="search.addDestination" /></FlexBox.Fill>
                </FlexBox>
            ) : null}
        </FlexBox>
    );
});

export default GeoSearchPicker;
