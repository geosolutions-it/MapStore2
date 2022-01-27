import React, {useEffect} from "react";
import {createPlugin} from "../../utils/PluginsUtils";
import {connect} from "react-redux";
import {setPrintParameter} from "../../actions/print";
import {Option} from "./Option";
import printReducer from "../../reducers/print";
import {addMapTransformer} from "../../utils/PrintUtils";

const mapTransformer = (style, labels = true, labelXStyle, labelYStyle, frameRatio, frameStyle, formatter) => (state, map) => {
    if (state.print?.spec?.params?.graticule) {
        return {
            ...map,
            layers: [...map.layers, {
                type: "graticule",
                visibility: true,
                labels,
                frame: !!frameRatio,
                frameRatio,
                frameStyle,
                style,
                labelXStyle,
                labelYStyle,
                xLabelFormatter: formatter,
                yLabelFormatter: formatter
            }]
        };
    }
    return map;
};

export const Graticule = ({
    style,
    labels,
    labelStyle,
    labelXStyle,
    labelYStyle,
    frame,
    frameStyle,
    labelFormatter,
    ...props}) => {
    useEffect(() => {
        addMapTransformer("graticule", mapTransformer(style, labels, labelXStyle || labelStyle, labelYStyle || labelStyle, frame ?? 0, frameStyle, labelFormatter));
    }, []);
    return (
        <Option
            property="graticule"
            label="print.graticule"
            {...props}
        />

    );
};

/**
 * Graticule toggle plugin for Print. This plugin adds the possibility for the user
 * to add a graticule to the printed map.
 *
 * @class PrintGraticule
 * @memberof plugins.print
 * @static
 *
 * @prop {object} cfg.style style object for the graticule lines (defaults to an orange dashed line).
 * @prop {number} cfg.frame adds a frame around in the map, of the given percentage size (defaults to 0.1 = 10%).
 * It is useful if combined with labels, to improve labels readability.
 * @prop {object} cfg.frameStyle style (stroke and fill) of the optional frame, defaults to a white frame with a black border.
 * @prop {boolean} cfg.labels shows coordinate labels in addition to the graticule lines (defaults to true).
 * @prop {object} cfg.labelXStyle optional style object for the labels on the both axis.
 * @prop {object} cfg.labelStyle specific style object for the labels on the X axis.
 * @prop {object} cfg.labelYStyle specific style object for the labels on the Y axis.
 * @example
 * // include the widget in the Print plugin left-panel container, after
 * // text inputs, with custom styles, labels and a frame
 * {
 *   "name": "PrintGraticule",
 *   "override": {
 *      "Print": {
 *          "priority": 1,
            "target": "left-panel",
            "position": 3
 *      }
 *   },
 *   "cfg": {
 *      "frame": 0.07,
        "style": {
            "color": "#000000",
            "weight": 1,
            "lineDash": [0.5, 4],
            "opacity": 0.5
        },
        "frameStyle": {
            "color": "#000000",
            "weight": 3,
            "fillColor": "#FFFFFF"
        },
        "labelXStyle": {
            "color": "#000000",
            "font": "sans-serif",
            "fontWeight": "bold",
            "fontSize": "20",
            "labelOutlineColor": "#FFFFFF",
            "labelOutlineWidth": 2
        },
        "labelYStyle": {
            "color": "#000000",
            "font": "sans-serif",
            "fontWeight": "bold",
            "fontSize": "20",
            "labelOutlineColor": "#FFFFFF",
            "labelOutlineWidth": 2,
            "rotation": 90,
            "verticalAlign": "top",
            "textAlign": "center"
        }
 *   }
 * }
 */
export default createPlugin("PrintGraticule", {
    component: connect(
        (state) => ({
            spec: state?.print?.spec || {}
        }), {
            onChangeParameter: setPrintParameter
        }
    )(Graticule),
    reducers: {print: printReducer},
    containers: {
        Print: {
            priority: 1,
            target: "left-panel",
            position: 5
        }
    }
});
