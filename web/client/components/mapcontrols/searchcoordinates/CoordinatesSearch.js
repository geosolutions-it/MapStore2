/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {isNumber} from "lodash";
import {FormGroup, Glyphicon, InputGroup, MenuItem, Row} from "react-bootstrap";

import Message from "../../I18N/Message";
import CoordinateEntry from "../../misc/coordinateeditors/CoordinateEntry";
import DropdownToolbarOptions from "../../misc/toolbar/DropdownToolbarOptions";
import { zoomAndAddPoint, changeCoord } from '../../../actions/search';
import { reproject} from '../../../utils/CoordinatesUtils';

/**
 * CoordinateOptions for Search bar
 * @memberof CoordinatesSearch
 *
 */
export const CoordinateOptions = ({
    clearCoordinates: (onClearCoordinatesSearch, onChangeCoord) =>{
        onClearCoordinatesSearch({owner: "search"});
        const clearedFields = ["lat", "lon", "xCoord", "yCoord", "currentMapXYCRS"];
        const resetVal = '';
        clearedFields.forEach(field => onChangeCoord(field, resetVal));
    },
    areValidCoordinates: (coordinate) => {
        if (!coordinate) return false;
        return isNumber(coordinate?.lon) && isNumber(coordinate?.lat);
    },
    zoomToPoint: (onZoomToPoint, coordinate, defaultZoomLevel = 12) => {
        onZoomToPoint({
            x: parseFloat(coordinate.lon),
            y: parseFloat(coordinate.lat)
        }, defaultZoomLevel, "EPSG:4326");
    },
    coordinateFormatChange: (format, onChangeFormat, showOptions, activeTool) => ({
        buttonConfig: {
            title: <Glyphicon glyph="cog"/>,
            tooltipId: "search.changeSearchInputField",
            tooltipPosition: "bottom",
            className: "square-button-md no-border",
            pullRight: true
        },
        menuOptions: [
            {
                active: format === "decimal",
                onClick: () => onChangeFormat("decimal"),
                text: <Message msgId="search.decimal"/>
            }, {
                active: format === "aeronautical",
                onClick: () => onChangeFormat("aeronautical"),
                text: <Message msgId="search.aeronautical"/>
            }
        ],
        visible: showOptions && activeTool === "coordinatesSearch",
        Element: DropdownToolbarOptions
    }),
    removeIcon: (
        activeTool,
        coordinate,
        onClearCoordinatesSearch,
        onChangeCoord) =>({
        visible: (['coordinatesSearch', 'mapCRSCoordinatesSearch'].includes(activeTool)) && (isNumber(coordinate.lon) || isNumber(coordinate.lat) || isNumber(coordinate.xCoord) || isNumber(coordinate.yCoord)),
        onClick: () => CoordinateOptions.clearCoordinates(onClearCoordinatesSearch, onChangeCoord)
    }),
    searchIcon: (activeTool, coordinate, onZoomToPoint, defaultZoomLevel) => ({
        visible: ["coordinatesSearch", "mapCRSCoordinatesSearch"].includes(activeTool),
        onClick: () => {
            if ((['coordinatesSearch', 'mapCRSCoordinatesSearch'].includes(activeTool)) && CoordinateOptions.areValidCoordinates(coordinate)) {
                CoordinateOptions.zoomToPoint(onZoomToPoint, coordinate, defaultZoomLevel);
            }
        }
    }),
    coordinatesMenuItem: ({activeTool, searchText, clearSearch, onChangeActiveSearchTool, onClearBookmarkSearch, currentMapCRS, onChangeFormat}) =>{
        if (currentMapCRS === 'EPSG:4326') {
            return (<MenuItem active={activeTool === "coordinatesSearch"} onClick={() => {
                if (searchText !== undefined && searchText !== "") {
                    clearSearch();
                }
                onClearBookmarkSearch("selected");
                onChangeActiveSearchTool("coordinatesSearch");
                document.dispatchEvent(new MouseEvent('click'));
            }}>
                <Glyphicon glyph={"search-coords"}/> <Message msgId="search.coordinatesSearch"/>
            </MenuItem>);
        }
        return (<><MenuItem active={activeTool === "coordinatesSearch"} onClick={() => {
            if (searchText !== undefined && searchText !== "") {
                clearSearch();
            }
            onClearBookmarkSearch("selected");
            onChangeActiveSearchTool("coordinatesSearch");
            document.dispatchEvent(new MouseEvent('click'));
        }}>
            <Glyphicon glyph={"search-coords"}/> <Message msgId="search.coordinatesSearch"/>
        </MenuItem>
        <MenuItem active={activeTool === "mapCRSCoordinatesSearch"} onClick={() => {
            if (searchText !== undefined && searchText !== "") {
                clearSearch();
            }
            onClearBookmarkSearch("selected");
            onChangeActiveSearchTool("mapCRSCoordinatesSearch");
            onChangeFormat("decimal");
            document.dispatchEvent(new MouseEvent('click'));
        }}>
            <span style={{marginLeft: 20}}>
                <Glyphicon glyph={"search-coords"}/> <Message msgId="search.currentMapCRS"/>
            </span>
        </MenuItem>
        </>);
    }
});


/**
 * CoordinatesSearch component
 * @param {object} props Component props
 * @param {object} props.coordinate coordinate position in lat lon
 * @param {string} props.format current format to display the coordinates
 * @param {func} props.onClearCoordinatesSearch on click clear coordinates
 * @param {func} props.onZoomToPoint on click zoom to extent
 * @param {number} props.defaultZoomLevel default zoom level on zoom to extent
 * @param {func} props.onChangeCoord triggered on changing coordinate position
 *
 */

const CoordinatesSearch = ({
    coordinate = {},
    format,
    onClearCoordinatesSearch,
    onZoomToPoint,
    onChangeCoord,
    defaultZoomLevel,
    currentMapCRS,
    aeronauticalOptions = {
        seconds: {
            decimals: 4,
            step: 0.0001
        }
    },
    constraintsCoordEditor = {
        decimal: {
            lat: {
                min: -90,
                max: 90
            },
            lon: {
                min: -180,
                max: 180
            }
        }
    }}) => {

    const {zoomToPoint, areValidCoordinates} = CoordinateOptions;

    const changeCoordinates = (coord, value) => {
        onChangeCoord(coord, parseFloat(value));
        // set current map crs to coordinate object
        if (coordinate?.currentMapXYCRS !== currentMapCRS && currentMapCRS !== "EPSG:4326") onChangeCoord('currentMapXYCRS', currentMapCRS);
        if (!areValidCoordinates()) {
            onClearCoordinatesSearch({owner: "search"});
        }
        // if there is mapCRS available --> calculate X/Y values by reproject to display in case switch to MapCRS
        if (currentMapCRS !== 'EPSG:4326') {
            // if there are lat, lon values --> reproject the point and get xCoord and yCoord for map CRS
            const latNumVal = coord === 'lat' ? parseFloat(value) : coordinate.lat;
            const lonNumVal = coord === 'lon' ? parseFloat(value) : coordinate.lon;
            const isLatNumberVal = isNumber(latNumVal) && !isNaN(latNumVal);
            const isLonNumberVal = isNumber(lonNumVal) && !isNaN(lonNumVal);
            if (isLatNumberVal && isLonNumberVal) {
                const reprojectedValue = reproject([lonNumVal, latNumVal], 'EPSG:4326', currentMapCRS, true);
                const parsedXCoord = parseFloat((reprojectedValue?.x));
                const parsedYCoord = parseFloat((reprojectedValue?.y));
                onChangeCoord('xCoord', parsedXCoord);
                onChangeCoord('yCoord', parsedYCoord);

                return;
            }
            coordinate.xCoord && onChangeCoord('xCoord', '');
            coordinate.yCoord && onChangeCoord('yCoord', '');
        }
    };

    const onZoom = () => {
        zoomToPoint(onZoomToPoint, coordinate, defaultZoomLevel);
    };

    return (
        <div className="coordinateEditor" style={{flexWrap: format === "decimal" ? "nowrap" : "wrap" }}>
            <Row className={`entryRow ${format}`}>
                <FormGroup>
                    <InputGroup >
                        <InputGroup.Addon style={{minWidth: 45}}><Message msgId="search.latitude"/></InputGroup.Addon>
                        <CoordinateEntry
                            owner="search"
                            format={format}
                            aeronauticalOptions={aeronauticalOptions}
                            coordinate="lat"
                            idx={1}
                            value={coordinate.lat}
                            constraints={constraintsCoordEditor}
                            onChange={(dd) => changeCoordinates("lat", dd)}
                            onKeyDown={() => {
                                if (areValidCoordinates(coordinate)) {
                                    onZoom();
                                }
                            }}
                        />
                    </InputGroup>
                </FormGroup>
            </Row>
            <Row className={`entryRow ${format}`}>
                <FormGroup>
                    <InputGroup>
                        <InputGroup.Addon style={{minWidth: 45}}><Message msgId="search.longitude"/></InputGroup.Addon>
                        <CoordinateEntry
                            owner="search"
                            format={format}
                            aeronauticalOptions={aeronauticalOptions}
                            coordinate="lon"
                            idx={2}
                            value={coordinate.lon}
                            constraints={constraintsCoordEditor}
                            onChange={(dd) => changeCoordinates("lon", dd)}
                            onKeyDown={() => {
                                if (areValidCoordinates(coordinate)) {
                                    onZoom();
                                }
                            }}
                        />
                    </InputGroup>
                </FormGroup>
            </Row>
        </div>
    );
};

CoordinatesSearch.propTypes = {
    coordinate: PropTypes.object,
    format: PropTypes.string,
    onClearCoordinatesSearch: PropTypes.func,
    onZoomToPoint: PropTypes.func,
    onChangeCoord: PropTypes.func,
    defaultZoomLevel: PropTypes.number,
    currentMapCRS: PropTypes.string
};

export default connect((state)=>{
    return {
        coordinate: state.search.coordinate || {}
    };
}, {
    onZoomToPoint: zoomAndAddPoint,
    onChangeCoord: changeCoord
})(CoordinatesSearch);
