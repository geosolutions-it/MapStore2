export const CONTROL_NAME = "itinerary";

export const GRAPHHOPPER_PROVIDER_URL = "https://graphhopper.com/api/1/route";

export const ITINERARY_ROUTE_LAYER = `${CONTROL_NAME}-route`;

export const DEFAULT_PROVIDER = 'GraphHopper';

export const DRAGGABLE_CONTAINER_ID = 'waypoints';

/**
 * Default snap prevention options. (GraphHopper)
 */
export const DEFAULT_SNAP_PREVENTION_OPTIONS = [
    { value: 'motorway', labelId: 'itinerary.motorway' },
    { value: 'trunk', labelId: 'itinerary.trunk' },
    { value: 'ferry', labelId: 'itinerary.ferry' },
    { value: 'tunnel', labelId: 'itinerary.tunnel' },
    { value: 'bridge', labelId: 'itinerary.bridge' },
    { value: 'ford', labelId: 'itinerary.ford' }
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
    WAYPOINT: "#76d0f7"
};

/**
 * Default GraphHopper specific configurations
 */
export const DEFAULT_GRAPHHOPPER_CONFIGS = {
    profile: 'car',
    optimize: true,
    snap_prevention: [],
    points_encoded: false,
    elevation: true,
    calc_points: true,
    instructions: true,
    algorithm: 'alternative_route',
    'alternative_route.max_paths': 3,
    details: ['street_name']
};
