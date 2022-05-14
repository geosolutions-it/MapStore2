import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {createPlugin} from "../../utils/PluginsUtils";
import {connect} from "react-redux";
import {setPrintParameter} from "../../actions/print";
import { getMessageById } from '../../utils/LocaleUtils';
import Choice from "../../components/print/Choice";
import {addTransformer} from "../../utils/PrintUtils";
import printReducer from "../../reducers/print";

export const OutputFormat = ({
    items,
    spec,
    onChangeParameter,
    defaultFormat = "pdf",
    allowedFormats,
    enabled = true
}, context) => {
    function filterNotAllowed(formats) {
        return allowedFormats ?
            allowedFormats.filter(f1 => formats.find(f2 => f2.value === f1.value)) :
            formats;
    }
    useEffect(() => {
        if (enabled) {
            addTransformer("outputFormat", (state, printSpec) => Promise.resolve({
                ...printSpec,
                outputFormat: state.print?.spec?.outputFormat ?? defaultFormat
            }));
        }
    }, []);
    return enabled ? (
        <>
            <Choice
                selected={spec?.outputFormat ?? defaultFormat}
                onChange={(format) => onChangeParameter("outputFormat", format)}
                items={filterNotAllowed(items)}
                label={getMessageById(context.messages, "print.outputFormat")}
            />
        </>
    ) : null;
};

OutputFormat.contextTypes = {
    messages: PropTypes.object
};


/**
 * OutputFormat plugin for Print. This plugin adds the possibility for the user
 * to export the printed map into additional formats, other than PDF.
 *
 * The default mapfish-print engine can be enabled to support many (image) formats.
 * When that happens (by configuring the formats property in config.yml), this plugin
 * shows a combo box to choose between them. To enable all supported formats, just add the
 * following at the top level of the file:
 *
 * formats:
 *  - '*'
 *
 * @class PrintOutputFormat
 * @memberof plugins.print
 * @static
 *
 * @prop {boolean} cfg.enabled  allows disabling the widget in a very simple way (true by default)
 * @prop {string} cfg.defaultFormat initially selected format
 * @prop {string[]} cfg.allowedFormats optional list of supported formats (with descriptions),
 * filters the one configured in config.yaml
 *
 * @example
 * // include the widget in the Print plugin right-panel container, after resolution
 * // and a png defaultFormat, and a list of allowed formats
 * {
 *   "name": "PrintOutputFormat",
 *   "override": {
 *      "Print": {
 *          "target": "right-panel",
 *          "position": 1.5
 *      }
 *   },
 *   "cfg": {
 *      "defaultFormat": "png",
 *      "allowedFormats": [{value: "pdf", name: "PDF"}, {value: "png", name: "PNG"}, {value: "jpg", name: "JPEG"}]
 *   }
 * }
 */
export default createPlugin("PrintOutputFormat", {
    component: connect(
        (state) => ({
            spec: state?.print?.spec || {},
            items: state?.print?.capabilities?.outputFormats?.map((format) => ({
                name: format.name,
                value: format.name
            })) ?? [{
                name: 'pdf',
                value: 'pdf'
            }]
        }), {
            onChangeParameter: setPrintParameter
        }
    )(OutputFormat),
    reducers: {print: printReducer},
    containers: {
        Print: {
            priority: 1,
            target: "left-panel",
            position: 3
        }
    }
});
