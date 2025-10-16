/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo, useState } from 'react';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import flattenDeep from 'lodash/flattenDeep';

import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Message from '../../../components/I18N/Message';
import { download } from '../../../utils/FileUtils';
import { formatDistance, formatTime, getSignIcon } from '../utils/ItineraryUtils';
import { ALTERNATIVE_ROUTES_COLORS, CONTROL_NAME } from '../constants';

/**
 * Component to display the itinerary routes details
 * @prop {object[]} itineraryData - The itinerary data array based on the selected provider. Refer to the example below for the expected format
 * @prop {function} onAddAsLayer - Function to add the itinerary data as a layer.
 * @example
 * // Example itinerary data structure:
 * const itineraryData = [
 *   {
 *     features: [
 *       {
 *         id: 1,
 *         geometry: {
 *           type: 'Point',
 *           coordinates: [100, 100]
 *         }
 *       }
 *     ],
 *     style: {},
 *     routes: [ // multiple routes
 *        [ // instruction for the route
 *           {
 *             text: 'Continue onto Main Street',
 *             streetName: 'Main Street',
 *             distance: 100,
 *             time: 100,
 *             sign: 1
 *           }
 *        ]
 *     ]
 *   }
 * ];
 *
 * // Direction sign indicators:
 * // -98: U-turn without knowledge of right/left direction
 * // -8:  Left U-turn
 * // -7:  Keep left
 * // -3:  Turn sharp left
 * // -2:  Turn left
 * // -1:  Turn slight left
 * // 0:   Continue on street
 * // 1:   Turn slight right
 * // 2:   Turn right
 * // 3:   Turn sharp right
 * // 4:   Finish instruction before the last point
 * // 5:   Instruction before a via point
 * // 6:   Instruction before entering a roundabout
 * // 7:   Keep right
 * // 8:   Right U-turn
 */
const RouteDetail = ({ itineraryData, onAddAsLayer }) => {
    if (isEmpty(itineraryData)) return null;

    const [isExpandedByIndex, setIsExpandedByIndex] = useState({});
    const { routes = [], features = [], style = {} } = itineraryData ?? {};

    const getFeaturesByIndex = (index) => {
        const hasMultipleRoutes = features.filter(feature => !isNil(get(feature, 'properties.routeIndex'))).length > 1;
        if (hasMultipleRoutes) {
            return features.filter(feature => {
                const id = get(feature, 'id', '');
                return [`route-${index}`, 'start-marker', 'end-marker'].includes(id);
            });
        }
        return features;
    };

    const exportGeoJSON = (routeName, index) => {
        download(
            JSON.stringify({
                type: 'FeatureCollection',
                msType: CONTROL_NAME,
                features: getFeaturesByIndex(index),
                style: style ?? {}
            }),
            `${routeName}.json`,
            'application/geo+json'
        );
    };

    const onAddLayer = (index) => {
        onAddAsLayer({
            features: getFeaturesByIndex(index),
            style: style ?? {}
        });
    };

    const routeNames = useMemo(() => {
        let _routeNames = [];
        const streetNames = flattenDeep(
            routes.map((route) =>
                route.map((instruction) => instruction.streetName)
                    .filter(Boolean)
            ));
        routes.forEach((_, index) => {
            if (index === 0) {
                _routeNames.push(streetNames[index]);
            } else {
                const streetName = streetNames
                    .find((_streetName, i) =>
                        i !== 0 && !_routeNames.includes(_streetName));
                if (streetName) {
                    _routeNames.push(streetName);
                }
            }
        });
        return _routeNames;
    }, [routes]);

    return (
        <div className="itinerary-detail-container">
            <FlexBox className="space-between">
                <FlexBox column>
                    <Text fontSize="md" strong><Message msgId="itinerary.routeItineraries" /></Text>
                </FlexBox>
            </FlexBox>
            {routes.map((route, index) => {
                const routeName = routeNames?.[index];
                const viaRoute = routeName;
                // Calculate total distance and time for the entire itinerary
                const totalDistance = route.reduce((sum, instruction) => sum + instruction.distance, 0);
                const totalTime = route.reduce((sum, instruction) => sum + instruction.time, 0);

                return (
                    <FlexBox key={index} column className="itinerary-route-detail">
                        <FlexBox.Fill
                            className="itinerary-route-detail-header"
                            variant="default"
                        >
                            <FlexBox gap="sm" className="space-between" centerChildrenVertically>
                                <Glyphicon
                                    onClick={() => setIsExpandedByIndex(prev => ({ ...prev, [index]: !prev[index] }))}
                                    glyph={isExpandedByIndex[index] ? "bottom" : "next"}
                                    className="expand-icon"
                                />
                                <FlexBox.Fill flexBox centerChildren className="space-between">
                                    <FlexBox column gap="sm">
                                        <Text fontSize="md" strong className="itinerary-via-route">
                                            <Message msgId="itinerary.viaRoute" msgParams={{ routeName: viaRoute }} />
                                        </Text>
                                        <div style={{border: `2px solid ${ALTERNATIVE_ROUTES_COLORS[index]}`, width: 50}}/>
                                    </FlexBox>
                                    <FlexBox column gap="sm" className="time-distance">
                                        <Text fontSize="md" strong>{formatTime(totalTime)}</Text>
                                        <Text fontSize="sm" strong>{formatDistance(totalDistance)}</Text>
                                    </FlexBox>
                                </FlexBox.Fill>
                                <DropdownButton
                                    noCaret
                                    pullRight
                                    title={<Glyphicon glyph="option-vertical" />}
                                    className="itinerary-options square-button-md"
                                >
                                    <MenuItem onClick={() => exportGeoJSON(viaRoute, index)}>
                                        <Message msgId="itinerary.exportAsGeoJSON" />
                                    </MenuItem>
                                    <MenuItem onClick={() => onAddLayer(index)}>
                                        <Message msgId="itinerary.addAsLayer" />
                                    </MenuItem>
                                </DropdownButton>
                            </FlexBox>
                        </FlexBox.Fill>
                        {isExpandedByIndex[index] && (
                            <div className="itinerary-instruction-container">
                                {route.map((instruction, idx) => (
                                    <div key={idx}>
                                        <FlexBox centerChildrenVertically className="itinerary-instruction-item">
                                            <FlexBox className="itinerary-instruction-icon">
                                                <Glyphicon {...getSignIcon(instruction.sign)} />
                                            </FlexBox>
                                            <FlexBox.Fill flexBox column>
                                                <Text>{instruction.text}</Text>
                                                {instruction.sign === 6 && (
                                                    <FlexBox centerChildrenVertically gap="sm" className="itinerary-roundabout-info">
                                                        <Glyphicon glyph="info-sign" />
                                                        <Text fontSize="sm"><Message msgId="itinerary.goThroughRoundabout" /></Text>
                                                    </FlexBox>
                                                )}
                                            </FlexBox.Fill>
                                        </FlexBox>
                                        {idx !== route.length - 1 && (
                                            <FlexBox flexBox gap="md" className="time-distance-separator">
                                                <div className="icon-placeholder"></div>
                                                <FlexBox.Fill className="time-distance-container">
                                                    <Text fontSize="sm">
                                                        {formatTime(instruction.time)} ({formatDistance(instruction.distance)})
                                                    </Text>
                                                    <div className="separator"></div>
                                                </FlexBox.Fill>
                                            </FlexBox>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </FlexBox>
                );
            })}
        </div>
    );
};

RouteDetail.defaultProps = {
    itineraryData: {},
    onAddAsLayer: () => {}
};

export default RouteDetail;
