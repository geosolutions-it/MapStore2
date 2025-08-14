import uuid from "uuid";

import { ALTERNATIVE_ROUTES_COLORS } from "../constants";

const createMarkerSvgDataUrl = (fillColor, size, number) => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.5}" viewBox="0 0 32 48">
        <path
            d="M16 0C8 0 0 8 0 16c0 10 16 32 16 32s16-22 16-32c0-8-8-16-16-16z"
            fill="${fillColor}"
            stroke="#000"
            stroke-opacity="0.2"
            stroke-width="1"
        />
        <circle cx="16" cy="16" r="6" fill="#fff" />
        ${number ? `
            <text x="16" y="16" text-anchor="middle" dominant-baseline="middle"
            font-size="10" font-family="sans-serif" fill="#000">${number}</text>
        ` : ''}
        </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const getRouteId = (index) => `route-${index}`;

export const getWaypointFeatures = ({
    waypoints = [],
    bbox = [],
    getSnappedWaypoints = () => [],
    getFeatureGeometry = () => {},
    parseItinerary = () => {}
}) => {

    // Create features array with route lines and markers
    const features = [];

    // Add route line features
    waypoints.forEach((waypoint, index) => {
        const routeFeature = {
            type: 'Feature',
            id: getRouteId(index),
            geometry: getFeatureGeometry(waypoint),
            properties: {
                geometryType: 'LineString',
                routeIndex: index
            }
        };
        features.push(routeFeature);

        const snappedWaypoints = getSnappedWaypoints(waypoint);
        snappedWaypoints.forEach((coord, sIndex) => {
            if (sIndex === 0 && index === 0) {
                const startFeature = {
                    type: 'Feature',
                    id: 'start-marker',
                    geometry: { type: 'Point', coordinates: coord },
                    properties: {
                        geometryType: 'Point',
                        id: 'start-marker',
                        number: null
                    }
                };
                features.push(startFeature);
            } else if (sIndex === snappedWaypoints.length - 1 && index === 0) {
                const endFeature = {
                    type: 'Feature',
                    id: 'end-marker',
                    geometry: { type: 'Point', coordinates: coord },
                    properties: {
                        geometryType: 'Point',
                        id: 'end-marker',
                        number: null
                    }
                };
                features.push(endFeature);
            } else {
                const waypointFeature = {
                    type: 'Feature',
                    id: `snapped-waypoint-${index}-${sIndex}`,
                    properties: {
                        id: `waypoint-marker-${index}-${sIndex}`,
                        geometryType: 'Point'
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: coord
                    }
                };
                features.push(waypointFeature);
            }
        });
    });

    const style = {
        format: 'geostyler',
        body: {
            name: 'itinerary-route-style-cesium',
            rules: [
                ...waypoints.map((path, index) => {
                    const snappedWaypoints = getSnappedWaypoints(path);
                    let routLineStyles = [{
                        name: `route-lines-${index}`,
                        filter: ['&&',
                            ['==', 'geometryType', 'LineString'],
                            ['==', 'routeIndex', index]
                        ],
                        id: getRouteId(index),
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: ALTERNATIVE_ROUTES_COLORS[index],
                                width: 6,
                                opacity: 1,
                                cap: 'round',
                                join: 'round',
                                msClampToGround: true
                            }
                        ]
                    }];
                    snappedWaypoints.forEach((_, sIndex) => {
                        // skip start and end markers
                        if (sIndex !== 0 && sIndex !== snappedWaypoints.length - 1) {
                            routLineStyles.push({
                                name: `waypoint-marker-${index}-${sIndex}`,
                                filter: ['&&',
                                    ['==', 'geometryType', 'Point'],
                                    ['==', 'id', `waypoint-marker-${index}-${sIndex}`]
                                ],
                                symbolizers: [
                                    {
                                        kind: 'Icon',
                                        image: createMarkerSvgDataUrl('#76d0f7', 28, sIndex),
                                        size: 28,
                                        opacity: 1,
                                        msClampToGround: true
                                    }
                                ]
                            });
                        }
                    });
                    return routLineStyles;
                }).flat(),
                {
                    name: 'start-markers',
                    filter: ['==', 'id', 'start-marker'],
                    symbolizers: [
                        {
                            kind: 'Icon',
                            image: createMarkerSvgDataUrl('#3388ff', 32, null),
                            size: 32,
                            opacity: 1,
                            msClampToGround: true
                        }
                    ]
                },
                {
                    name: 'end-markers',
                    filter: ['==', 'id', 'end-marker'],
                    symbolizers: [
                        {
                            kind: 'Icon',
                            image: createMarkerSvgDataUrl('#d32919', 32, null),
                            size: 32,
                            opacity: 1,
                            msClampToGround: true
                        }
                    ]
                }
            ]
        }
    };

    const data = {
        layer: {
            id: uuid(),
            type: 'vector',
            name: 'route-itinerary',
            features: features,
            visibility: true,
            style
        },
        bbox
    };

    return { ...data, data: parseItinerary(data) };
};

/**
 * Format the distance
 * @param {number} meters - The distance in meters
 * @returns {string} - The formatted distance
 */
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${parseFloat(meters.toFixed(0))} m`;
    }
    return `${parseFloat((meters / 1000).toFixed(2))} km`;
};

/**
 * Format the time
 * @param {number} milliseconds - The time in milliseconds
 * @returns {string} - The formatted time
 */
export const formatTime = (milliseconds) => {
    const totalSeconds = milliseconds / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let timeString = '';
    if (hours > 0) {
        timeString += `${hours} hr `;
    }
    if (minutes > 0) {
        timeString += `${minutes} min `;
    }
    return timeString.trim();
};

/**
 * Get the icon for the sign
 * @param {number} sign - The sign of the instruction
 * @returns {React.ReactNode} - The icon for the sign
 */
export const getSignIcon = (sign) => {
    switch (sign) {
    case 0: // Continue
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(0deg)' }
        };
    case 1: // Turn slight right
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(15deg)' }
        };
    case 2: // Turn right
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(90deg)' }
        };
    case 3: // Turn sharp right
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(135deg)' }
        };
    case 4: // Arrive at destination
        return {
            glyph: 'map-marker',
            style: { transform: 'rotate(0deg)' }
        };
    case 5: // Waypoint
        return {
            glyph: 'record',
            style: { transform: 'rotate(0deg)' }
        };
    case 6: // Roundabout
        return {
            glyph: 'refresh',
            style: { transform: 'rotate(0deg)' }
        };
    case 7: // Keep right
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(30deg)' }
        };
    case -1: // Turn slight left
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(-15deg)' }
        };
    case -2: // Turn left
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(-90deg)' }
        };
    case -3: // Turn sharp left
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(-135deg)' }
        };
    case -7: // Keep left
        return {
            glyph: 'arrow-up',
            style: { transform: 'rotate(-30deg)' }
        };
    case -98: // U-turn
        return {
            glyph: 'repeat',
            style: { transform: 'rotate(90deg)' }
        };
    default:
        return {
            glyph: 'info-sign',
            style: { transform: 'rotate(0deg)' }
        };
    }
};
