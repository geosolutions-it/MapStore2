import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPlugin} from "../../utils/PluginsUtils";
import { getMessageById } from '../../utils/LocaleUtils';

import { setPrintParameter } from "../../actions/print";

import {FormGroup, FormControl, ControlLabel} from "react-bootstrap";

import get from "lodash/get";

function getType(type) {
    if (type !== "textarea") {
        return {type};
    }
    return {componentClass: type};
}

export const TextInput = ({spec, property, label, placeholder, actions, onChangeParameter, path = "params.", type = "text", additionalProperty = true}, context) => {
    const fullProperty = path + property;
    useEffect(() => {
        if (additionalProperty) actions.addParameter(property, get(spec, fullProperty) ?? "");
    }, []);
    return (
        <FormGroup>
            {label && <ControlLabel>{getMessageById(context.messages, label)}</ControlLabel> || null}
            <FormControl {...getType(type)} value={get(spec, fullProperty)} placeholder={placeholder && getMessageById(context.messages, placeholder)}
                onChange={(e) => onChangeParameter(fullProperty, e.target.value)}/>
        </FormGroup>
    );
};

TextInput.contextTypes = {
    messages: PropTypes.object
};

/**
 * TextInput plugin for Print. This plugin adds a text input control to the Print dialog UI.
 * Allows adding user entered text to the printed page (in addition to the standard title and description).
 * It requires a config.yaml that defines the property variable bound to the plugin.
 *
 * @class PrintTextInput
 * @memberof plugins.print
 * @static
 *
 * @prop {String} cfg.property name of the variable in config.yaml bound to this input
 * @prop {String} cfg.label localized label (either a fixed string or a property name in the translation property files)
 * @prop {String} cfg.placeholder localized placeholder text (either a fixed string or a property name in the translation property files)
 * @prop {String} cfg.type type of input control (either text or textarea, text is the default)
 *
 * @example
 * // include a new text input plugin in the left-panel container, between title and description
 * // bound to the extra property (${extra} in config.yaml)
 * {
 *   "name": "PrintInputText",
 *   "override": {
 *      "target": "left-panel",
 *      "position": 1.5
 *   },
 *   "cfg": {
 *       "property": "extra",
 *       "label": "print.extralabel",
 *       "placeholder": "print.extraplaceholder",
 *    }
 * }
 */
export default createPlugin("PrintTextInput", {
    component: connect(
        (state) => ({
            spec: state?.print?.spec || {}
        }), {
            onChangeParameter: setPrintParameter
        }
    )(TextInput),
    containers: {
        Print: {
            priority: 1
        }
    }
});
