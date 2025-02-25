import React, { useEffect } from "react";
import {Option} from "./Option";
import {createPlugin} from "../../utils/PluginsUtils";
import {connect} from "react-redux";
import {setPrintParameter, addPrintParameter} from "../../actions/print";
import Message from "../../components/I18N/Message";
import {addTransformer} from "../../utils/PrintUtils";

import localeReducer from "../../reducers/locale";
import printReducer from "../../reducers/print";

/**
 * Default formatter function for scale.
 * @memberof plugins.print
 * @param {*} scale current map/printed scale
 * @param {*} locale current application locale
 * @returns {string} 1:<scale>, using the current locale for formatting the denominator.
 */
export function defaultFormat(scale, locale = "en-US") {
    const val = new Intl.NumberFormat(locale, {maximumFractionDigits: 0}).format(scale);
    return `1:${val}`;
}

const printScaleSelector = (state) => ({
    spec: state?.print?.spec ?? {},
    scale: state?.print?.map?.scale,
    locale: state?.locale?.current ?? "en-US"
});

const scaleTransformer = (format) => (state, spec) => {
    const scale = spec?.pages?.[0]?.scale;
    const {locale} = printScaleSelector(state);
    return Promise.resolve({
        ...spec,
        mapScale: spec?.includeScale ? `${format(scale, locale, true)}` : ""
    });
};

export const Scale = (props) => {
    const {map, scale, locale, label = "print.scale", optionLabel = "print.includeScale", actions, onAddParameter, ...rest} = props;
    const formatScale = props.format || defaultFormat;
    useEffect(() => {
        addTransformer("scale", scaleTransformer(formatScale), 4);
    }, []);
    return (<div id="print-scale">
        <div style={{"float": "left", "marginRight": 5}}><Message msgId={label}/> {formatScale(map?.scale ?? scale, locale)}</div>
        <Option {...rest} actions={{addParameter: onAddParameter}} property="includeScale" label={optionLabel}/>
    </div>);
};

/**
 * Scale plugin for Print. This plugin adds an option to include the scale in the printed pages.
 * It requires a config.yaml with the mapScale variable in it, or you will get an error when printing.
 *
 * You can customize the scale formatting, by specifying a format property, with a custom formatter
 * function. The formatter function is used both to show the scale on the dialog, and on the
 * printed page. It receives as parameters :
 *  - the actual scale denominator
 *  - the current application locale
 *  - a boolean flag, true for printing, false for the UI dialog, so that formatting can be
 *    different in the two cases, if desired.
 *
 * @class PrintScale
 * @memberof plugins.print
 * @static
 *
 * @prop {boolean} cfg.format function to customize the actual printed scale (default format produces something like 1:10,000)
 * @prop {string} cfg.label label localized text
 * @prop {string} cfg.optionLabel label for the checkbox localized text
 *
 * @example
 * // include the widget in the Print plugin left-panel container, after title and description
 * // and a custom formatting function
 * {
 *   "name": "PrintScale",
 *   "override": {
 *      "Print": {
 *           "target": "left-panel",
 *           "position": 3
 *      }
 *   },
 *   "cfg": {
 *       "format": "{(function(scale, locale, forPrint) {return (forPrint ? 'MyScale ' : '' ) + scale;})}"
 *   }
 * }
 */
export default createPlugin("PrintScale", {
    component: connect(
        printScaleSelector, {
            onChangeParameter: setPrintParameter,
            onAddParameter: addPrintParameter
        }
    )(Scale),
    reducers: {locale: localeReducer, print: printReducer},
    containers: {
        Print: {
            priority: 1,
            target: "left-panel",
            position: 3
        }
    }
});
