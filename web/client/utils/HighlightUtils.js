export const GEOMETRY_PROPERTY = '__geometry__type__';
export function createHighlightStyle(highlightStyle = {}) {
    const defaultStyle = {
        color: '#f2f2f2',
        lineColor: '#3075e9',
        fillOpacity: 0.3,
        opacity: 1,
        width: 2,
        radius: 10
    };

    // Merge custom styles with default values
    const style = { ...defaultStyle, ...highlightStyle };

    return {
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
                symbolizers: [{
                    kind: 'Fill',
                    color: style.color,
                    fillOpacity: style.fillOpacity,
                    outlineColor: style.lineColor,
                    outlineOpacity: style.opacity,
                    outlineWidth: style.width
                }]
            }, {
                name: 'Default Line Style',
                ruleId: "defaultLine",
                filter: ['||',
                    ['==', GEOMETRY_PROPERTY, 'LineString'],
                    ['==', GEOMETRY_PROPERTY, 'MultiLineString']
                ],
                symbolizers: [{
                    kind: 'Line',
                    color: style.lineColor,
                    opacity: style.opacity,
                    width: style.width
                }]
            }, {
                name: 'Default Point Style',
                ruleId: "defaultPoint",
                filter: ['||',
                    ['==', GEOMETRY_PROPERTY, 'Point'],
                    ['==', GEOMETRY_PROPERTY, 'MultiPoint']
                ],
                symbolizers: [{
                    kind: 'Mark',
                    color: style.color,
                    fillOpacity: style.fillOpacity,
                    strokeColor: style.lineColor,
                    strokeOpacity: style.opacity,
                    strokeWidth: style.width,
                    radius: style.radius,
                    wellKnownName: 'Circle',
                    msBringToFront: true
                }]
            }]
        }
    };
}

/**
 * Add the the proper options to the highlight layer:
 * - `visibility`: `true`
 * - `features`: the features to highlight should be enhanced with the geometry type in properties, to allow the default style to work
 * - `style`: the default style applies a different style for each geometry type. The geometry type is extracted from the geometry type and added to the feature properties
 * @param {options} base options
 * @param highlightStyle
 * @returns the new options with the highlight layer
 */
export const getHighlightLayerOptions = ({ features, ...options }, highlightStyle = {}) => {
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
        style: createHighlightStyle(highlightStyle)
    };
};
