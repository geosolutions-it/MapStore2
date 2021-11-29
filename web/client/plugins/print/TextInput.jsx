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
