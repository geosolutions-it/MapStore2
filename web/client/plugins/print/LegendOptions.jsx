import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPlugin} from "../../utils/PluginsUtils";
import { getMessageById } from '../../utils/LocaleUtils';

import { setPrintParameter } from "../../actions/print";
import Font from "../../components/print/Font";
import PrintOption from "../../components/print/PrintOption";
import { TextInput } from "./TextInput";

const PrintLegendOptions = ({spec, onChangeParameter}, context) => {
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
                property="iconSize"
                onChangeParameter={onChangeParameter}
            />
            <TextInput
                label={getMessageById(context.messages, "print.legend.dpi")}
                spec={spec}
                type="number"
                property="legendDpi"
                onChangeParameter={onChangeParameter}
            />
        </>
    );
};

PrintLegendOptions.contextTypes = {
    messages: PropTypes.object
};

export default createPlugin("PrintLegendOptions", {
    component: connect(
        (state) => ({
            spec: state?.print?.spec || {}
        }), {
            onChangeParameter: setPrintParameter
        }
    )(PrintLegendOptions),
    containers: {
        Print: {
            priority: 1
        }
    }
});
