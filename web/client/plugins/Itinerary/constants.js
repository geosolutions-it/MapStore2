export const CONTROL_NAME = "itinerary";

export const GRAPHHOPPER_PROVIDER_URL = "https://graphhopper.com/api/1/route";

export const ITINERARY_ROUTE_LAYER = `${CONTROL_NAME}-route`;

export const DEFAULT_PROVIDER = 'GraphHopper';

export const DRAGGABLE_CONTAINER_ID = 'waypoints';

export const SNAP_PREVENTION_OPTIONS = [
    { value: 'motorway', labelId: 'itinerary.motorway' },
    { value: 'trunk', labelId: 'itinerary.trunk' },
    { value: 'ferry', labelId: 'itinerary.ferry' },
    { value: 'tunnel', labelId: 'itinerary.tunnel' },
    { value: 'bridge', labelId: 'itinerary.bridge' },
    { value: 'ford', labelId: 'itinerary.ford' }
];

export const DEFAULT_PROFILE_OPTIONS = [
    { value: 'foot', glyph: 'male' },
    { value: 'car', glyph: 'car' }
];

export const ALTERNATIVE_ROUTES_COLORS = ["#3388ff", "#1F3A93", "#B87333"];
