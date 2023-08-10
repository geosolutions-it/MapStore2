
export const GEOMETRY_PROPERTY  = '__geometry__type__';
export const HIGH_LIGHT_STYLE = {
    format: 'geostyler',
    body: {
        name: "highlight",
        rules: [{
            name: 'Default Polygon Style',
            ruleId: "defaultPolygon",
            filter: ['||',
                ['==', GEOMETRY_PROPERTY, 'Polygon'],
                ['==', GEOMETRY_PROPERTY, 'MultiPolygon']
            ],
            symbolizers: [
                {
                    kind: 'Fill',
                    color: '#f2f2f2',
                    fillOpacity: 0.3,
                    outlineColor: '#3075e9',
                    outlineOpacity: 1,
                    outlineWidth: 2
                }
            ]
        }, {
            name: 'Default Line Style',
            ruleId: "defaultLine",
            filter: ['||',
                ['==', GEOMETRY_PROPERTY, 'LineString'],
                ['==', GEOMETRY_PROPERTY, 'MultiLineString']
            ],
            symbolizers: [
                {
                    kind: 'Line',
                    color: '#3075e9',
                    opacity: 1,
                    width: 2
                }
            ]
        }, {
            name: 'Default Point Style',
            ruleId: "defaultPoint",
            filter: ['||',
                ['==', GEOMETRY_PROPERTY, 'Point'],
                ['==', GEOMETRY_PROPERTY, 'MultiPoint']
            ],
            symbolizers: [{
                kind: 'Mark',
                color: '#f2f2f2',
                fillOpacity: 0.3,
                strokeColor: '#3075e9',
                strokeOpacity: 1,
                strokeWidth: 2,
                radius: 10,
                wellKnownName: 'Circle',
                msBringToFront: true
            }]
        }]
    }
};

/**
 * Add the the proper options to the highlight layer:
 * - `visibility`: `true`
 * - `features`: the features to highlight should be enhanced with the geometry type in properties, to allow the default style to work
 * - `style`: the default style applies a different style for each geometry type. The geometry type is extracted from the geometry type and added to the feature properties
 * @param {options} base options
 * @returns the new options with the highlight layer
 */
export const getHighlightLayerOptions = ({features, ...options}) => {
    return {
        ...options,
        visibility: true, // required by cesium
        features: features?.map(feature => ({
            ...feature,
            properties: {
                ...(feature?.properties || {}),
                [GEOMETRY_PROPERTY]: feature?.geometry?.type // there is not actually a function to determine the geometry type from the feature. This is a workaround to automatically apply the default style
            }

        })),
        style: HIGH_LIGHT_STYLE
    };
};
