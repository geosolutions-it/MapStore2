import React from "react";
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

export const TextInput = ({spec, property, label, placeholder, onChangeParameter, path = "params.", type = "text"}, context) => {
    return (
        <FormGroup>
            {label && <ControlLabel>{getMessageById(context.messages, label)}</ControlLabel> || null}
            <FormControl {...getType(type)} value={get(spec, path + property)} placeholder={placeholder && getMessageById(context.messages, placeholder)}
                onChange={(e) => onChangeParameter(path + property, e.target.value)}/>
        </FormGroup>
    );
};

TextInput.contextTypes = {
    messages: PropTypes.object
};

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
