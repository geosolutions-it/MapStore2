export const CONTROL_NAME = "itinerary";

export const ITINERARY_ROUTE_LAYER = `${CONTROL_NAME}-route`;

export const DEFAULT_PROVIDER = 'GraphHopper';

export const DRAGGABLE_CONTAINER_ID = 'waypoints';

export const DEFAULT_SEARCH_CONFIG = [{type: "nominatim", priority: 5, options: {limit: 10, polygon_geojson: 1, format: 'json'}}];

/**
 * Default snap prevention options. (GraphHopper)
 */
export const DEFAULT_SNAP_PREVENTION_OPTIONS = [
    { value: 'motorway', "class": 'road_class', labelId: 'itinerary.motorway' },
    { value: 'trunk', "class": 'road_class', labelId: 'itinerary.trunk' },
    { value: 'ferry', "class": 'road_environment', labelId: 'itinerary.ferry' },
    { value: 'tunnel', "class": 'road_environment', labelId: 'itinerary.tunnel' },
    { value: 'bridge', "class": 'road_environment', labelId: 'itinerary.bridge' }
];

/**
 * Default profile options. (GraphHopper)
 */
export const DEFAULT_PROFILE_OPTIONS = [
    { value: 'foot', glyph: 'male' },
    { value: 'car', glyph: 'car' }
];

/**
 * Predefined colors of the alternative routes. (GraphHopper)
 */
export const ALTERNATIVE_ROUTES_COLORS = ["#3388ff", "#1F3A93", "#B87333"];

/**
 * Predefined colors of the waypoints markers
 */
export const WAYPOINT_MARKER_COLORS = {
    START: "#3388ff",
    END: "#d32919",
    WAYPOINT: "#3388ff"
};

/**
 * Default GraphHopper specific configurations
 */
export const DEFAULT_PROVIDER_CONFIGS = {
    profile: 'car',
    optimize: true,
    points_encoded: false,
    elevation: true,
    calc_points: true,
    instructions: true,
    algorithm: 'alternative_route',
    'alternative_route.max_paths': 3,
    details: ['street_name'],
    'ch.disable': true
};
