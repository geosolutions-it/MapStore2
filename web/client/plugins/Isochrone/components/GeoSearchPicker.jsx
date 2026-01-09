/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useEffect, useMemo, useRef, useState } from 'react';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { Glyphicon } from 'react-bootstrap';
import { Combobox } from 'react-widgets';
import PropTypes from 'prop-types';

import { getMessageById } from '../../../utils/LocaleUtils';
import FlexBox from '../../../components/layout/FlexBox';
import CoordinatesRow from '../../../components/misc/coordinateeditors/CoordinatesRow';
import { ButtonWithTooltip } from '../../../components/misc/Button';
import { generateTemplateString } from '../../../utils/TemplateUtils';

/**
 * GeoSearchPicker component
 * Allows adding, removing, and sorting waypoints, searching by location name, and selecting locations from the map.
 * @param {Object} props - The component props
 * @param {Array} props.waypoint - The waypoint to display
 * @param {Array} props.location - The location to display
 * @param {Array} props.searchResults - The search results from nomatim
 * @param {boolean} props.searchLoading - The flag indicating if the search is loading
 * @param {Function} props.onSetWaypoint - The function to set the waypoint
 * @param {Function} props.onSearchByLocationName - The function to search by location name
 * @param {Function} props.onUpdateLocation - The function to update the location. Location are the coordinates of the waypoint
 * @param {Function} props.onToggleCoordinateEditor - The function to toggle the coordinate editor
 * @param {Function} props.onSelectLocationFromMap - The function to select the location from the map
 */
const GeoSearchPicker = ({
    waypoint,
    location,
    displayName = "properties.display_name",
    searchResults,
    searchLoading,
    onSetWaypoint,
    onSearchByLocationName,
    onUpdateLocation,
    onSelectLocationFromMap,
    onToggleCoordinateEditor
}, {messages}) => {

    const onLocationChange = (value) => {
        onSetWaypoint((prev)=> ({...prev, value}));
    };

    const onLocationSelect = (result) => {
        onSetWaypoint((prev) => ({
            ...prev,
            value: isNil(result.lat)
                // nominatim result object
                ? get(result, displayName, generateTemplateString(displayName || "")(result))
                : null
        }));
        const value = isNil(result.lat) ? result?.properties : result;

        let newLocation = cloneDeep(location);
        const {lat, lon} = value ?? {};
        if (lat && lon) {
            newLocation = [Number(lon), Number(lat)];
        }
        onUpdateLocation(newLocation);
    };

    const [showCoordinatesEditor, setShowCoordinatesEditor] = useState(false);
    const [inputValue, setInputValue] = useState(waypoint.value);
    const [lon, lat] = location ?? [];
    const coordinate = isNil(lat) || isNil(lon) ? {} : { lat: Number(lat), lon: Number(lon) };

    const prevCoordinate = useRef(coordinate);
    useEffect(() => {
        if (!isEmpty(coordinate) && !isEqual(prevCoordinate.current, coordinate)) {
            prevCoordinate.current = coordinate;
            onToggleCoordinateEditor(false);
        }
    }, [coordinate]);

    const handleToggleCoordinatesEditor = () => {
        const toggleState = !showCoordinatesEditor;
        setShowCoordinatesEditor(toggleState);
        // Clear search input and results when toggling betweeen search and coordinates editor
        if (toggleState) {
            setInputValue(null);
            onLocationChange(null);
            onSearchByLocationName('');
            onSelectLocationFromMap();
            onToggleCoordinateEditor(true);
        } else {
            setInputValue(null);
            onLocationChange(null);
            onSearchByLocationName('');
        }
    };

    useEffect(() => {
        // Clear input when location is cleared
        if (isEmpty(location) || isNil(location)) {
            setInputValue(null);
        }
    }, [location]);

    useEffect(() => {
        // Clear input when waypoint value is cleared
        if (isNil(waypoint.value) || waypoint.value === '') {
            setInputValue(null);
        } else {
            setInputValue(waypoint.value);
        }
    }, [waypoint.value]);

    // Clear input and waypoint when component unmounts
    useEffect(() => {
        return () => {
            setInputValue(null);
            onLocationChange(null);
            onSearchByLocationName('');
        };
    }, []);

    const handleChange = (newValue) => {
        setInputValue(newValue);
        onLocationChange(newValue);
        onSearchByLocationName(newValue);
    };

    const handleSelect = (result) => {
        const _displayName = get(result, displayName, generateTemplateString(displayName || "")(result));
        setInputValue(_displayName);
        onLocationChange(_displayName);
        if (result) {
            onLocationSelect(result);
        }
    };

    // Transform results to format expected by Combobox
    const options = useMemo(() => searchResults.map(result => {
        const _value = get(result, displayName, generateTemplateString(displayName || "")(result));
        return {
            value: _value,
            label: _value,
            original: result
        };
    }), [searchResults, displayName]);


    return (
        <FlexBox
            className="ms-isochrone-geosearch-waypoint"
            centerChildrenVertically
            gap="sm"
        >
            <FlexBox.Fill flexBox>
                <FlexBox style={{flex: 2}}>
                    {showCoordinatesEditor
                        ? <CoordinatesRow
                            format={"decimal"}
                            key="coordinate-editor-geosearch"
                            showToolButtons={false}
                            component={coordinate}
                            customClassName="ms-isochrone-geosearch-coord-editor"
                            isDraggable={false}
                            showDraggable={false}
                            formatVisible={false}
                            showLabels={false}
                            removeVisible={false}
                            onSubmit={(_, value) => onLocationSelect(value)}
                            renderer="annotations"
                        />
                        : <div style={{ width: '100%' }}>
                            <Combobox
                                value={inputValue}
                                data={options}
                                textField="label"
                                valueField="value"
                                placeholder={getMessageById(messages, "isochrone.searchByLocationName")}
                                busy={searchLoading}
                                filter={false}
                                onChange={handleChange}
                                onSelect={(item) => handleSelect(item?.original || item)}
                                messages={{
                                    emptyList: searchLoading
                                        ? getMessageById(messages, "isochrone.searching")
                                        : getMessageById(messages, "isochrone.noResultsFound")
                                }}
                                style={{ width: '100%' }}
                            />
                        </div>
                    }
                </FlexBox>
                <ButtonWithTooltip
                    square
                    className="ms-isochrone-waypoint-locate"
                    onClick={handleToggleCoordinatesEditor}
                    tooltipId={`isochrone.${showCoordinatesEditor ? "searchTooltip" : "coordinateTooltip"}`}
                >
                    <Glyphicon glyph={showCoordinatesEditor ? "search" : "point"} />
                </ButtonWithTooltip>
            </FlexBox.Fill>
        </FlexBox>
    );
};

GeoSearchPicker.defaultProps = {
    waypoint: {},
    location: [],
    searchResults: [],
    searchLoading: false,
    onSetWaypoint: () => {},
    onSearchByLocationName: () => {},
    onUpdateLocation: () => {},
    onSelectLocationFromMap: () => {},
    onToggleCoordinateEditor: () => {}
};

GeoSearchPicker.contextTypes = {
    messages: PropTypes.object
};

export default GeoSearchPicker;
