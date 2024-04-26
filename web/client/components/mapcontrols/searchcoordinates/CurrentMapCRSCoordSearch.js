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
    React.useEffect(() => {
        if (coordinate.lat) {
            const latValue = coordinate.lat ? reproject([0, coordinate.lat], 'EPSG:4326', currentMapCRS, true)?.y : undefined;
            onChangeCoord('yCoord', latValue);
        }
        if (coordinate.lon) {
            const lonValue = coordinate.lon ? reproject([coordinate.lon, 0], 'EPSG:4326', currentMapCRS, true)?.x : undefined;
            onChangeCoord('xCoord', lonValue);
        }
    }, []);

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
    const changeCoordinates = (coord, value) => {
        const numValue = parseFloat(value);
        onChangeCoord(coord, numValue);
        if (coord === 'yCoord') {
            const latValue = numValue ? reproject([0, numValue], currentMapCRS, 'EPSG:4326', true)?.y : undefined;
            onChangeCoord('lat', latValue ? Number((latValue)) : latValue);
        } else {
            const lonValue = numValue ? reproject([numValue, 0], currentMapCRS, 'EPSG:4326', true)?.x : undefined;
            onChangeCoord('lon', lonValue ? Number((lonValue)) : lonValue);
        }
        if (!areValidCoordinates()) {
            onClearCoordinatesSearch({owner: "search"});
        }
    };

    const onZoom = () => {
        zoomToPoint(onZoomToPoint, coordinate, defaultZoomLevel);
    };

    return (
        <div className="coordinateEditor" style={{flexWrap: "nowrap" }}>
            <Row className={`entryRow ${format}`}>
                <FormGroup>
                    <InputGroup >
                        <InputGroup.Addon style={{minWidth: 45}}><Message msgId="search.yCoord"/></InputGroup.Addon>
                        <CoordinateEntry
                            format={format}
                            coordinate="Y"
                            idx={1}
                            value={coordinate?.yCoord}
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
            <Row className={`entryRow ${format}`}>
                <FormGroup>
                    <InputGroup>
                        <InputGroup.Addon style={{minWidth: 45}}><Message msgId="search.xCoord"/></InputGroup.Addon>
                        <CoordinateEntry
                            format={format}
                            coordinate="X"
                            idx={2}
                            value={coordinate?.xCoord}
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
