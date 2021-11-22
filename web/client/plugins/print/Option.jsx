import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPlugin, handleExpression} from "../../utils/PluginsUtils";
import { getMessageById } from '../../utils/LocaleUtils';

import { setPrintParameter } from "../../actions/print";

import PrintOptionComp from "../../components/print/PrintOption";

export const PrintOption = (props, context) => {
    const {spec, property, label, onChangeParameter, enabled = true} = props;
    return handleExpression({}, {...props}, "{" + enabled + "}") ? (<PrintOptionComp checked={!!spec[property]}
        label={getMessageById(context.messages, label)}
        onChange={v => onChangeParameter(property, v)}/>) : null;
};

PrintOption.contextTypes = {
    messages: PropTypes.object
};

export default createPlugin("PrintOption", {
    component: connect(
        (state) => ({
            spec: state?.print?.spec || {}
        }), {
            onChangeParameter: setPrintParameter
        }
    )(PrintOption),
    containers: {
        Print: {
            priority: 1
        }
    }
});
