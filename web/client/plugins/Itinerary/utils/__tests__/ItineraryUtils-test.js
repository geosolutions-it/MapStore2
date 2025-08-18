/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    getWaypointFeatures,
    formatDistance,
    formatTime,
    getSignIcon
} from '../ItineraryUtils';
import { ALTERNATIVE_ROUTES_COLORS } from '../../constants';

describe('ItineraryUtils', () => {
    const mockGetSnappedWaypoints = (path) => {
        if (path === 'route1') {
            return [[2.3522, 48.8566], [3.0000, 47.0000], [4.8320, 45.7578]];
        }
        if (path === 'route2') {
            return [[5.0000, 44.0000], [6.0000, 43.0000]];
        }
        return [];
    };

    const mockGetFeatureGeometry = (path) => {
        if (path === 'route1') {
            return {
                type: 'LineString',
                coordinates: [[2.3522, 48.8566], [3.0000, 47.0000], [4.8320, 45.7578]]
            };
        }
        if (path === 'route2') {
            return {
                type: 'LineString',
                coordinates: [[5.0000, 44.0000], [6.0000, 43.0000]]
            };
        }
        return { type: 'LineString', coordinates: [] };
    };

    const defaultParams = {
        response: { status: 'success' },
        waypoints: ['route1', 'route2'],
        bbox: [2.3522, 43.0000, 6.0000, 48.8566],
        routes: [
            [{ text: 'Start route 1' }, { text: 'End route 1' }],
            [{ text: 'Start route 2' }, { text: 'End route 2' }]
        ],
        getSnappedWaypoints: mockGetSnappedWaypoints,
        getFeatureGeometry: mockGetFeatureGeometry
    };

    describe('getWaypointFeatures', () => {
        it('should create waypoint features with default parameters', () => {
            const result = getWaypointFeatures(defaultParams);

            expect(result).toBeTruthy();
            expect(result.layer).toBeTruthy();
            expect(result.layer.type).toBe('vector');
            expect(result.layer.name).toBe('route-itinerary');
            expect(result.layer.visibility).toBe(true);
            expect(result.bbox).toEqual(defaultParams.bbox);
        });

        it('should create route line features', () => {
            const result = getWaypointFeatures(defaultParams);
            const routeFeatures = result.layer.features.filter(f => f.properties.geometryType === 'LineString');

            expect(routeFeatures.length).toBe(2);
            expect(routeFeatures[0].id).toBe('route-0');
            expect(routeFeatures[0].properties.routeIndex).toBe(0);
            expect(routeFeatures[1].id).toBe('route-1');
            expect(routeFeatures[1].properties.routeIndex).toBe(1);
        });

        it('should create start marker features', () => {
            const result = getWaypointFeatures(defaultParams);
            const startMarkers = result.layer.features.filter(f => f.properties.id === 'start-marker');

            expect(startMarkers.length).toBe(1);
            expect(startMarkers[0].id).toBe('start-marker');
            expect(startMarkers[0].geometry.type).toBe('Point');
            expect(startMarkers[0].properties.number).toBeFalsy();
        });

        it('should create end marker features', () => {
            const result = getWaypointFeatures(defaultParams);
            const endMarkers = result.layer.features.filter(f => f.properties.id === 'end-marker');

            expect(endMarkers.length).toBe(1);
            expect(endMarkers[0].id).toBe('end-marker');
            expect(endMarkers[0].geometry.type).toBe('Point');
            expect(endMarkers[0].properties.number).toBeFalsy();
        });

        it('should create waypoint marker features', () => {
            const result = getWaypointFeatures(defaultParams);
            const waypointMarkers = result.layer.features?.filter(f => f.properties.id?.includes('waypoint-marker'));
            expect(waypointMarkers.length).toBe(3);
            waypointMarkers.forEach(marker => {
                expect(marker.geometry.type).toBe('Point');
                expect(marker.properties.geometryType).toBe('Point');
            });
        });

        it('should create GeoStyler style configuration', () => {
            const result = getWaypointFeatures(defaultParams);

            expect(result.layer.style).toBeTruthy();
            expect(result.layer.style.format).toBe('geostyler');
            expect(result.layer.style.body.name).toBe('itinerary-route-style-cesium');
            expect(result.layer.style.body.rules).toBeTruthy();
        });

        it('should create route line style rules', () => {
            const result = getWaypointFeatures(defaultParams);
            const routeLineRules = result.layer.style.body.rules.filter(r => r.name.includes('route-lines'));

            expect(routeLineRules.length).toBe(2);
            routeLineRules.forEach((rule, index) => {
                expect(rule.filter).toEqual(['&&',
                    ['==', 'geometryType', 'LineString'],
                    ['==', 'routeIndex', index]
                ]);
                expect(rule.symbolizers[0].kind).toBe('Line');
                expect(rule.symbolizers[0].color).toBe(ALTERNATIVE_ROUTES_COLORS[index]);
                expect(rule.symbolizers[0].width).toBe(6);
                expect(rule.symbolizers[0].msClampToGround).toBe(true);
            });
        });

        it('should create waypoint marker style rules', () => {
            const result = getWaypointFeatures(defaultParams);
            const waypointMarkerRules = result.layer.style.body.rules.filter(r => r.name.includes('waypoint-marker'));
            expect(waypointMarkerRules.length).toBe(1);
            waypointMarkerRules.forEach(rule => {
                expect(rule.filter).toEqual(['&&',
                    ['==', 'geometryType', 'Point'],
                    ['==', 'id', 'waypoint-marker-0-1']
                ]);
                expect(rule.symbolizers[0].kind).toBe('Icon');
                expect(rule.symbolizers[0].size).toBe(28);
                expect(rule.symbolizers[0].msClampToGround).toBe(true);
            });
        });

        it('should create start marker style rules', () => {
            const result = getWaypointFeatures(defaultParams);
            const startMarkerRule = result.layer.style.body.rules.find(r => r.name === 'start-markers');

            expect(startMarkerRule).toBeTruthy();
            expect(startMarkerRule.filter).toEqual(['==', 'id', 'start-marker']);
            expect(startMarkerRule.symbolizers[0].kind).toBe('Icon');
            expect(startMarkerRule.symbolizers[0].size).toBe(32);
            expect(startMarkerRule.symbolizers[0].msClampToGround).toBe(true);
        });

        it('should create end marker style rules', () => {
            const result = getWaypointFeatures(defaultParams);
            const endMarkerRule = result.layer.style.body.rules.find(r => r.name === 'end-markers');

            expect(endMarkerRule).toBeTruthy();
            expect(endMarkerRule.filter).toEqual(['==', 'id', 'end-marker']);
            expect(endMarkerRule.symbolizers[0].kind).toBe('Icon');
            expect(endMarkerRule.symbolizers[0].size).toBe(32);
            expect(endMarkerRule.symbolizers[0].msClampToGround).toBe(true);
        });

        it('should handle empty waypoints array', () => {
            const result = getWaypointFeatures({
                ...defaultParams,
                waypoints: []
            });

            expect(result.layer.features.length).toBe(0);
            expect(result.layer.style.body.rules.length).toBe(2); // Only start and end marker rules
        });

        it('should handle single waypoint', () => {
            const result = getWaypointFeatures({
                ...defaultParams,
                waypoints: ['route1']
            });

            const routeFeatures = result.layer.features.filter(f => f.properties.geometryType === 'LineString');
            expect(routeFeatures.length).toBe(1);
            expect(routeFeatures[0].properties.routeIndex).toBe(0);
        });

        it('should handle missing optional parameters', () => {
            const result = getWaypointFeatures({
                waypoints: ['route1'],
                getSnappedWaypoints: mockGetSnappedWaypoints,
                getFeatureGeometry: mockGetFeatureGeometry
            });

            expect(result).toBeTruthy();
            expect(result.layer).toBeTruthy();
            expect(result.bbox).toEqual([]);
            expect(result.data).toBeFalsy();
        });

        it('should handle waypoints with no snapped coordinates', () => {
            const result = getWaypointFeatures({
                ...defaultParams,
                getSnappedWaypoints: () => []
            });

            const routeFeatures = result.layer.features.filter(f => f.properties.geometryType === 'LineString');
            const markerFeatures = result.layer.features.filter(f => f.properties.geometryType === 'Point');

            expect(routeFeatures.length).toBe(2);
            expect(markerFeatures.length).toBe(0); // No markers when no snapped coordinates
        });
    });

    describe('formatDistance', () => {
        it('should format distances less than 1000 meters', () => {
            expect(formatDistance(0)).toBe('0 m');
            expect(formatDistance(100)).toBe('100 m');
            expect(formatDistance(999)).toBe('999 m');
        });

        it('should format distances 1000 meters and above in kilometers', () => {
            expect(formatDistance(1000)).toBe('1 km');
            expect(formatDistance(1500)).toBe('1.5 km');
            expect(formatDistance(10000)).toBe('10 km');
            expect(formatDistance(12345)).toBe('12.35 km');
        });

        it('should handle decimal distances correctly', () => {
            expect(formatDistance(1500)).toBe('1.5 km');
            expect(formatDistance(1234)).toBe('1.23 km');
            expect(formatDistance(9999)).toBe('10 km');
        });

        it('should handle edge cases', () => {
            expect(formatDistance(999.9)).toBe('1000 m');
            expect(formatDistance(1000.1)).toBe('1 km');
        });

        it('should handle very large distances', () => {
            expect(formatDistance(100000)).toBe('100 km');
            expect(formatDistance(1000000)).toBe('1000 km');
        });
    });

    describe('formatTime', () => {
        it('should format time in milliseconds to hours and minutes', () => {
            expect(formatTime(0)).toBe('');
            expect(formatTime(60000)).toBe('1 min');
            expect(formatTime(3600000)).toBe('1 hr');
            expect(formatTime(3660000)).toBe('1 hr 1 min');
        });

        it('should handle only minutes', () => {
            expect(formatTime(30000)).toBe('');
            expect(formatTime(60000)).toBe('1 min');
            expect(formatTime(120000)).toBe('2 min');
            expect(formatTime(3540000)).toBe('59 min');
        });

        it('should handle only hours', () => {
            expect(formatTime(3600000)).toBe('1 hr');
            expect(formatTime(7200000)).toBe('2 hr');
            expect(formatTime(10800000)).toBe('3 hr');
        });

        it('should handle hours and minutes', () => {
            expect(formatTime(3660000)).toBe('1 hr 1 min');
            expect(formatTime(7320000)).toBe('2 hr 2 min');
            expect(formatTime(7320000)).toBe('2 hr 2 min');
        });

        it('should handle edge cases', () => {
            expect(formatTime(3599999)).toBe('59 min');
            expect(formatTime(3600000)).toBe('1 hr');
            expect(formatTime(3600001)).toBe('1 hr');
        });

        it('should handle very large time values', () => {
            expect(formatTime(86400000)).toBe('24 hr');
            expect(formatTime(90000000)).toBe('25 hr');
        });
    });

    describe('getSignIcon', () => {
        it('should return correct icon for continue (sign 0)', () => {
            const result = getSignIcon(0);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(0deg)');
        });

        it('should return correct icon for turn slight right (sign 1)', () => {
            const result = getSignIcon(1);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(15deg)');
        });

        it('should return correct icon for turn right (sign 2)', () => {
            const result = getSignIcon(2);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(90deg)');
        });

        it('should return correct icon for turn sharp right (sign 3)', () => {
            const result = getSignIcon(3);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(135deg)');
        });

        it('should return correct icon for arrive at destination (sign 4)', () => {
            const result = getSignIcon(4);
            expect(result.glyph).toBe('map-marker');
            expect(result.style.transform).toBe('rotate(0deg)');
        });

        it('should return correct icon for waypoint (sign 5)', () => {
            const result = getSignIcon(5);
            expect(result.glyph).toBe('record');
            expect(result.style.transform).toBe('rotate(0deg)');
        });

        it('should return correct icon for roundabout (sign 6)', () => {
            const result = getSignIcon(6);
            expect(result.glyph).toBe('refresh');
            expect(result.style.transform).toBe('rotate(0deg)');
        });

        it('should return correct icon for keep right (sign 7)', () => {
            const result = getSignIcon(7);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(30deg)');
        });

        it('should return correct icon for turn slight left (sign -1)', () => {
            const result = getSignIcon(-1);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(-15deg)');
        });

        it('should return correct icon for turn left (sign -2)', () => {
            const result = getSignIcon(-2);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(-90deg)');
        });

        it('should return correct icon for turn sharp left (sign -3)', () => {
            const result = getSignIcon(-3);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(-135deg)');
        });

        it('should return correct icon for keep left (sign -7)', () => {
            const result = getSignIcon(-7);
            expect(result.glyph).toBe('arrow-up');
            expect(result.style.transform).toBe('rotate(-30deg)');
        });

        it('should return correct icon for U-turn (sign -98)', () => {
            const result = getSignIcon(-98);
            expect(result.glyph).toBe('repeat');
            expect(result.style.transform).toBe('rotate(90deg)');
        });

        it('should return default icon for unknown signs', () => {
            const result = getSignIcon(999);
            expect(result.glyph).toBe('info-sign');
            expect(result.style.transform).toBe('rotate(0deg)');
        });

        it('should return default icon for negative unknown signs', () => {
            const result = getSignIcon(-999);
            expect(result.glyph).toBe('info-sign');
            expect(result.style.transform).toBe('rotate(0deg)');
        });
    });

    describe('Error Handling', () => {
        it('should handle undefined parameters gracefully', () => {
            const result = getWaypointFeatures({
                response: undefined,
                waypoints: undefined,
                bbox: undefined,
                routes: undefined,
                getSnappedWaypoints: undefined,
                getFeatureGeometry: undefined
            });
            expect(result).toBeTruthy();
            expect(result.layer.features).toEqual([]);
        });

        it('should handle empty arrays and objects', () => {
            const result = getWaypointFeatures({
                response: {},
                waypoints: [],
                bbox: [],
                routes: [],
                getSnappedWaypoints: () => [],
                getFeatureGeometry: () => ({})
            });

            expect(result).toBeTruthy();
            expect(result.layer.features).toEqual([]);
        });

        it('should handle malformed waypoint data', () => {
            const result = getWaypointFeatures({
                ...defaultParams,
                getSnappedWaypoints: () => [null, undefined, 'invalid']
            });

            expect(result).toBeTruthy();
            expect(result.layer.features.length).toBeGreaterThan(0);
        });
    });
});
