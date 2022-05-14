import React from "react";
import PropTypes from "prop-types";
import { getMessageById } from '../../utils/LocaleUtils';

import Font from "../../components/print/Font";
import PrintOption from "../../components/print/PrintOption";
import { TextInput } from "./TextInput";

export const LegendOptions = ({spec, onChangeParameter, actions}, context) => {
    return (
        <>
            <Font
                family={spec?.fontFamily}
                size={spec?.fontSize}
                bold={spec?.bold}
                italic={spec?.italic}
                onChangeFamily={f => onChangeParameter('fontFamily', f)}
                onChangeSize={s => onChangeParameter('fontSize', s)}
                onChangeBold={b => onChangeParameter('bold', b)}
                onChangeItalic={i => onChangeParameter('italic', i)}
                label={getMessageById(context.messages, "print.legend.font")}/>
            <PrintOption
                label={getMessageById(context.messages, "print.legend.forceLabels")}
                checked={!!spec?.forceLabels}
                onChange={a => onChangeParameter("forceLabels", a)}/>
            <PrintOption
                label={getMessageById(context.messages, "print.legend.antiAliasing")}
                checked={!!spec?.antiAliasing}
                onChange={a => onChangeParameter("antiAliasing", a)}/>
            <TextInput
                label={getMessageById(context.messages, "print.legend.iconsSize")}
                spec={spec}
                type="number"
                additionalProperty={false}
                property="iconSize"
                path=""
                onChangeParameter={onChangeParameter}
                actions={actions}
            />
            <TextInput
                label={getMessageById(context.messages, "print.legend.dpi")}
                spec={spec}
                type="number"
                additionalProperty={false}
                property="legendDpi"
                path=""
                onChangeParameter={onChangeParameter}
                actions={actions}
            />
        </>
    );
};

LegendOptions.contextTypes = {
    messages: PropTypes.object
};

