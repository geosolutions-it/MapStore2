import React from 'react';
import { compose, branch, withProps, withHandlers, mapPropsStream } from 'recompose';

import loadingState from '../../components/misc/enhancers/loadingState';
import emptyState from '../../components/misc/enhancers/emptyState';

import describeFetch from '../../components/widgets/enhancers/wfsTable/describeFetch';
import '../../libs/bindings/rxjsRecompose';

import { colorToRgbaStr } from '../../utils/ColorUtils';

import StylePoint from '../../components/style/StylePoint';
import StylePolygon from '../../components/style/StylePolygon';
import StylePolyline from '../../components/style/StylePolyline';
import { extractGeometryType } from '../../utils/WFSLayerUtils';
import Message from '../../components/I18N/Message';

/*
 * Converts the style properties and handlers to re-use the shapefile styler.
 *
 * shapeStyle (internal for panel) is defined as:
 * ```json
 * {
 *  "marker": true,
 *  "radius": 2,
 *  "width": 2,
 *  "fill": "rgba(1,2,3,0.1)",
 *  "color": "rgba(1,2,3,0.1)",
 * }
 * ```
 * while MapStore Vector layer style is defined as :
 * ```json
 * {
 *   styleName: "marker" ,// opt
 *   style: {
 *      opacity: 0.1, // also stroke
 *      color: "rgba(1,2,3,0.1)",
 *      fillOpacity: 0.1,
 *      fillColor: "rgba(1,2,3, 0.1)",
 *      weight: 2, // width
 *      radius: 2
 *   }
 * }
 * ```
 */
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
                    "fillColor": `rgb(${r}, ${g}, ${b})`,
                    "fillOpacity": a
                });
                break;
            }
            case "color": {
                const { r, g, b, a } = value;
                onChange("style", {
                    ...style,
                    "color": `rgb(${r}, ${g}, ${b})`,
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
const SimpleVectorStyleEditor = compose(
    withGeometryType,
    loadingState(),
    emptyState(({ geometryType }) => !geometryType)
)(({ geometryType, element = {}, onChange = () => { } }) => {
    const CMP = stylers[geometryType];
    return (<React.Fragment>
        <h4>&nbsp;&nbsp;&nbsp;&nbsp;<Message msgId="layerProperties.style"/></h4>
        <CMP
            styleName={element.styleName}
            style={element.style}
            onChange={onChange}
        />
    </React.Fragment>);
});
export default SimpleVectorStyleEditor;
