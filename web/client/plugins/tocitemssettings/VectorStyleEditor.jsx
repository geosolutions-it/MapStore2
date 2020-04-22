import React from 'react';
import { compose, withProps, withHandlers } from 'recompose';
import { colorToRgbaStr } from '../../utils/ColorUtils';

import StylePoint from '../../components/style/StylePoint';
import StylePolygon from '../../components/style/StylePolygon';
import StylePolyline from '../../components/style/StylePolyline';

const shapeStyleAdapter = compose(
    withProps(({ style = {} }) => {
        const { fillColor, fillOpacity, color, opacity, shapeStyle, weight } = style;

        return {
            shapeStyle: {
                ...shapeStyle,
                width: weight,
                fill: colorToRgbaStr(fillColor, fillOpacity),
                color: colorToRgbaStr(color, opacity)
            }
        };
    }),
    withHandlers({
        setStyleParameter: ({ onChange = () => { } }) => (key, value) => {
            switch (key) {
            case "fill": {
                const { r, g, b, a } = value;
                onChange({
                    "fillColor": { r, g, b, a },
                    "fillOpacity": a
                });
                break;
            }
            case "color": {
                const { r, g, b, a } = value;
                onChange({
                    "color": `rgba(${r}, ${g}, ${b}, ${a})`,
                    "opacity": a
                });
                break;
            }
            case "width": {
                onChange({"weight": value});
                break;
            }
            default:
                onChange({[key]: value});
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

export default ({ geometryType = "Polygon", element = {}, onChange = () => { } }) => {
    const CMP = stylers[geometryType];
    return (<CMP
        style={element.style}
        onChange={(changes = {}) => {
            onChange("style", { ...(element.style || {}), ...changes });
        }}
    />);
};
