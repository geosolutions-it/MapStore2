import React from 'react';
import { compose, branch, withProps, withHandlers, mapPropsStream } from 'recompose';
import { get, head} from 'lodash';

import loadingState from '../../components/misc/enhancers/loadingState';
import emptyState from '../../components/misc/enhancers/emptyState';

import describeFetch from '../../components/widgets/enhancers/wfsTable/describeFetch';
import '../../libs/bindings/rxjsRecompose';

import { colorToRgbaStr } from '../../utils/ColorUtils';

import StylePoint from '../../components/style/StylePoint';
import StylePolygon from '../../components/style/StylePolygon';
import StylePolyline from '../../components/style/StylePolyline';

const shapeStyleAdapter = compose(
    withProps(({ style = {}, styleName }) => {
        const { fillColor, fillOpacity, color, opacity, shapeStyle, weight, radius } = style;

        return {
            shapeStyle: {
                ...shapeStyle,
                marker: styleName === "marker",
                radius: radius,
                width: weight,
                fill: colorToRgbaStr(fillColor, fillOpacity),
                color: colorToRgbaStr(color, opacity)
            }
        };
    }),
    withHandlers({
        setStyleParameter: ({ onChange = () => { }, style = {} }) => (key, value) => {
            switch (key) {
            case "fill": {
                const { r, g, b, a } = value;
                onChange( "style", {
                    ...style,
                    "fillColor": { r, g, b, a },
                    "fillOpacity": a
                });
                break;
            }
            case "color": {
                const { r, g, b, a } = value;
                onChange("style", {
                    ...style,
                    "color": `rgba(${r}, ${g}, ${b}, ${a})`,
                    "opacity": a
                });
                break;
            }
            case "width": {
                onChange("style", { ...style, "weight": value });
                break;
            }
            case "marker": {
                onChange("styleName", value ? "marker" : undefined );
                break;
            }
            default:
                onChange("style", { ...style, [key]: value });
                break;
            }
        }
    })
);

const stylers = {
    Polygon: shapeStyleAdapter(StylePolygon),
    MultiPolygon: shapeStyleAdapter(StylePolygon),
    GeometryCollection: shapeStyleAdapter(StylePolygon),
    LineString: shapeStyleAdapter(StylePolyline),
    MultiLineString: shapeStyleAdapter(StylePolyline),
    MultiPoint: shapeStyleAdapter(StylePoint),
    Point: shapeStyleAdapter(StylePoint)
};

/**
 * Extract GeometryType from JSON DescribeFeatureType
 */
const extractGeometryType = describeFeatureType => {
    const properties = get(describeFeatureType, "featureTypes[0].properties") || [];
    return properties && head(properties
        .filter(elem => elem.type.indexOf("gml:") === 0) // find fields of geometric type
        .map( elem => elem.type.split(":")[1]) // extract the geometry name. E.g. from gml:Point extract the "Point" string
    );
};

const withGeometryType = branch(
    ({element = {} }) => element.type === "wfs",
    // wfs layer
    mapPropsStream(props$ =>
        props$.combineLatest(
            props$
                .map(({ element }) => ({ layer: element }))
                .let(describeFetch)
                .map(({ error, loading, describeFeatureType }) => ({
                    error,
                    loading,
                    geometryType: !error && !loading && describeFeatureType && extractGeometryType(describeFeatureType)
                })),
            (props$, (originalProps, { geometryType, error, loading }) => ({
                ...originalProps,
                geometryType,
                error,
                loading
            }))
        )
    ),
    // vector layer
    withProps(({element: layer}) => {
        return {
            // TODO: handle multiple geometry types.
            geometryType: layer && layer.features && layer.features[0].geometry && layer.features[0].geometry.type
        };
    })
);

/**
 * A simple style editor for vector data, similar to the one for the ShapeFile import's one.
 * Used in TOC for vector data.
 */
export default compose(
    withGeometryType,
    loadingState(),
    emptyState(({ geometryType }) => !geometryType)
)(({ geometryType, element = {}, onChange = () => { } }) => {
    const CMP = stylers[geometryType];
    return (<CMP
        styleName={element.styleName}
        style={element.style}
        onChange={onChange}
    />);
});
