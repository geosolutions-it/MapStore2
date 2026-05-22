import React, {useEffect} from "react";
import PropTypes from "prop-types";
import { getMessageById } from '../../utils/LocaleUtils';

import PrintOptionComp from "../../components/print/PrintOption";

import get from "lodash/get";

export const Option = (props, context) => {
    const {spec, property, label, onChangeParameter, enabled = true, actions, path = "params.", additionalProperty = true} = props;
    const fullProperty = path + property;
    useEffect(() => {
        if (additionalProperty) actions?.addParameter(property, get(spec, fullProperty) ?? false);
    }, []);
    return  enabled ? (<PrintOptionComp checked={!!get(spec, fullProperty)}
        label={getMessageById(context.messages, label)}
        onChange={v => onChangeParameter(fullProperty, v)}/>) : null;
};

Option.contextTypes = {
    messages: PropTypes.object
};

