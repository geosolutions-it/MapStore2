/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {FormGroup, InputGroup, Row} from "react-bootstrap";
import { isNumber } from 'lodash';

import Message from "../../I18N/Message";
import CoordinateEntry from "../../misc/coordinateeditors/CoordinateEntry";
import { zoomAndAddPoint, changeCoord } from '../../../actions/search';
import { reproject} from '../../../utils/CoordinatesUtils';
import { getProjection } from '../../../utils/ProjectionUtils';
import {CoordinateOptions} from './CoordinatesSearch';
/**
 * CurrentMapCRSCoordinatesSearch component
 * @param {object} props Component props
 * @param {object} props.coordinate coordinate position in x y
 * @param {string} props.format current format to display the coordinates
 * @param {func} props.onClearCoordinatesSearch on click clear coordinates
 * @param {func} props.onZoomToPoint on click zoom to extent
 * @param {number} props.defaultZoomLevel default zoom level on zoom to extent
 * @param {func} props.onChangeCoord triggered on changing coordinate position
 *
 */

const CurrentMapCRSCoordinatesSearch = ({
    coordinate = {},
    format,
    onClearCoordinatesSearch,
    onZoomToPoint,
    onChangeCoord,
    defaultZoomLevel,
    currentMapCRS
}) => {
    const {zoomToPoint, areValidCoordinates} = CoordinateOptions;
    const getConstraintsCoordEditor = (projection) =>{
        const extent = getProjection(projection).extent;
        const [minx, miny, maxx, maxy] = extent;
        return {
            decimal: {
                yCoord: {
                    min: miny,
                    max: maxy
                },
                xCoord: {
                    min: minx,
                    max: maxx
                }
            }
        };
    };
    // helper function to validate if the coordinate is within the crs extent or not
    const isCoordWithinCrs = (value, coordType) => {
        const min = getConstraintsCoordEditor(currentMapCRS).decimal[coordType]?.min || 0;
        const max = getConstraintsCoordEditor(currentMapCRS).decimal[coordType]?.max || 0;
        const coordValue = parseFloat(value);
        if (isNaN(coordValue) || coordValue < min || coordValue > max ) {
            return false;
        }
        return true;
    };
    React.useEffect(() => {
        if (!currentMapCRS || currentMapCRS === 'EPSG:4326') return;
        // if there are lat, lon values --> reproject the point and get xCoord and yCoord for map CRS
        const isLatNumberVal = isNumber(coordinate.lat) && !isNaN(coordinate.lat);
        const isLonNumberVal = isNumber(coordinate.lon) && !isNaN(coordinate.lon);
        if (isLatNumberVal && isLonNumberVal) {
            const reprojectedValue = reproject([coordinate.lon, coordinate.lat], 'EPSG:4326', currentMapCRS, true);
            const parsedXCoord = parseFloat((reprojectedValue?.x));
            const parsedYCoord = parseFloat((reprojectedValue?.y));
            onChangeCoord('xCoord', parsedXCoord);
            onChangeCoord('yCoord', parsedYCoord);
            // if coords are out of crs extent --> clear the marker
            if (!isCoordWithinCrs(parsedXCoord, 'xCoord') || !isCoordWithinCrs(parsedYCoord, 'yCoord')) onClearCoordinatesSearch({owner: "search"});
            return;
        }
        coordinate.xCoord && onChangeCoord('xCoord', '');
        coordinate.yCoord && onChangeCoord('yCoord', '');
    }, [currentMapCRS]);

    const changeCoordinates = (coord, value) => {
        // clear coordinate marker
        if (!areValidCoordinates()) {
            onClearCoordinatesSearch({owner: "search"});
        }
        // set change value
        const numValue = parseFloat(value);
        onChangeCoord(coord, numValue);
        // reproject the new point and set lat/lon
        if (coord === 'yCoord') {
            const yCoordValidNum = isNumber(numValue) && !isNaN(numValue) && isCoordWithinCrs(numValue, 'yCoord');
            const xCoordValidNum = isNumber(coordinate.xCoord) && !isNaN(coordinate.xCoord) && isCoordWithinCrs(coordinate.xCoord, 'xCoord');
            if (yCoordValidNum && xCoordValidNum) {
                const projectedPt = reproject([coordinate.xCoord, numValue], currentMapCRS, 'EPSG:4326', true);
                onChangeCoord('lat', (projectedPt.y));
                onChangeCoord('lon', (projectedPt.x));
                return;
            }
        } else {
            const xCoordValidNum = isNumber(numValue) && !isNaN(numValue) && isCoordWithinCrs(numValue, 'xCoord');
            const yCoordValidNum = isNumber(coordinate.yCoord) && !isNaN(coordinate.yCoord)  && isCoordWithinCrs(coordinate.yCoord, 'yCoord');
            if (yCoordValidNum && xCoordValidNum) {
                const projectedPt = reproject([numValue, coordinate.yCoord], currentMapCRS, 'EPSG:4326', true);
                onChangeCoord('lat', (projectedPt.y));
                onChangeCoord('lon', (projectedPt.x));
                return;
            }
        }
        const resetValue = '';
        onChangeCoord('lat', resetValue);
        onChangeCoord('lon', resetValue);

    };

    const onZoom = () => {
        zoomToPoint(onZoomToPoint, coordinate, defaultZoomLevel);
    };

    return (
        <div className="coordinateEditor" style={{flexWrap: "nowrap" }}>
            <Row className={`entryRow ${format}`}>
                <FormGroup>
                    <InputGroup >
                        <InputGroup.Addon style={{minWidth: 45}}><Message msgId="search.xCoord"/></InputGroup.Addon>
                        <CoordinateEntry
                            max={getConstraintsCoordEditor(currentMapCRS).decimal.xCoord.max}
                            min={getConstraintsCoordEditor(currentMapCRS).decimal.xCoord.min}
                            owner="search"
                            format={format}
                            coordinate="X"
                            idx={2}
                            value={coordinate?.xCoord}
                            currentMapCRS={currentMapCRS}
                            constraints={getConstraintsCoordEditor(currentMapCRS)}
                            onChange={(dd) => changeCoordinates("xCoord", dd)}
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
                        <InputGroup.Addon style={{minWidth: 45}}><Message msgId="search.yCoord"/></InputGroup.Addon>
                        <CoordinateEntry
                            owner="search"
                            max={getConstraintsCoordEditor(currentMapCRS).decimal.yCoord.max}
                            min={getConstraintsCoordEditor(currentMapCRS).decimal.yCoord.min}
                            format={format}
                            coordinate="Y"
                            idx={1}
                            value={coordinate?.yCoord}
                            currentMapCRS={currentMapCRS}
                            constraints={getConstraintsCoordEditor(currentMapCRS)}
                            onChange={(dd) => changeCoordinates("yCoord", dd)}
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

CurrentMapCRSCoordinatesSearch.propTypes = {
    coordinate: PropTypes.object,
    format: PropTypes.string,
    onClearCoordinatesSearch: PropTypes.func,
    onZoomToPoint: PropTypes.func,
    onChangeCoord: PropTypes.func,
    defaultZoomLevel: PropTypes.number
};

export default connect((state)=>{
    return {
        coordinate: state.search.coordinate || {}
    };
}, {
    onZoomToPoint: zoomAndAddPoint,
    onChangeCoord: changeCoord
})(CurrentMapCRSCoordinatesSearch);
