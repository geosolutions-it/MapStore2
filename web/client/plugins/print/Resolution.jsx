import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPlugin} from "../../utils/PluginsUtils";
import { getMessageById } from '../../utils/LocaleUtils';

import { setPrintParameter } from "../../actions/print";
import Choice from "../../components/print/Choice";

export const Resolution = ({items, spec, onChangeParameter}, context) => {
    return (
        <>
            <Choice
                selected={spec?.resolution}
                onChange={(dpi) => onChangeParameter("resolution", dpi)}
                items={items}
                label={getMessageById(context.messages, "print.resolution")}
            />
        </>
    );
};

Resolution.contextTypes = {
    messages: PropTypes.object
};

export default createPlugin("PrintResolution", {
    component: connect(
        (state) => ({
            spec: state?.print?.spec || {},
            items: state?.print?.capabilities?.dpis?.map((dpi) => ({
                name: dpi.name + ' dpi',
                value: dpi.value
            })) ?? []
        }), {
            onChangeParameter: setPrintParameter
        }
    )(Resolution),
    containers: {
        Print: {
            priority: 1
        }
    }
});
