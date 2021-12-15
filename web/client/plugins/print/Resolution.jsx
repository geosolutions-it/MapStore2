import React from "react";
import PropTypes from "prop-types";
import { getMessageById } from '../../utils/LocaleUtils';

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

