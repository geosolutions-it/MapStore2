import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { getMessageById } from '../../utils/LocaleUtils';
import { compose } from "redux";

import { setPrintParameter } from "../../actions/print";
import Sheet from "../../components/print/Sheet";
import PrintOptionsComp from '../../components/print/PrintOptions';
import PrintOptionComp from '../../components/print/PrintOption';
import { currentLayouts, twoPageEnabled } from '../../selectors/print';

const LegendOption = connect((state) => ({
    checked: state.print && state.print.spec && !!state.print.spec.includeLegend,
    layouts: currentLayouts(state)
}), {
    onChange: setPrintParameter.bind(null, 'includeLegend')
})(PrintOptionComp);

export const MultiPageOption = connect((state) => ({
    checked: state.print && state.print.spec.includeLegend && state.print.spec && !!state.print.spec.twoPages,
    layouts: currentLayouts(state),
    isEnabled: () => twoPageEnabled(state)
}), {
    onChange: setPrintParameter.bind(null, 'twoPages')
})(PrintOptionComp);

export const LandscapeOption = connect((state) => ({
    selected: state.print && state.print.spec && state.print.spec.landscape ? 'landscape' : 'portrait',
    layouts: currentLayouts(state),
    options: [{label: 'print.alternatives.landscape', value: 'landscape'}, {label: 'print.alternatives.portrait', value: 'portrait'}]
}), {
    onChange: compose(setPrintParameter.bind(null, 'landscape'), (selected) => selected === 'landscape')
})(PrintOptionsComp);


const defaultAlternatives = [{
    name: "legend",
    component: LegendOption,
    regex: /legend/
}, {
    name: "2pages",
    component: MultiPageOption,
    regex: /2_pages/
}, {
    name: "landscape",
    component: LandscapeOption,
    regex: /landscape/
}];

function renderLayoutsAlternatives(alternatives, context) {
    return alternatives.map((alternative) =>
        (<alternative.component key={"printoption_" + alternative.name}
            label={getMessageById(context.messages, "print.alternatives." + alternative.name)}
            enableRegex={alternative.regex}
        />)
    );
}

export const Layout = ({layouts, spec, onChangeParameter, alternatives}, context) => {
    return (
        <>
            <Sheet key="sheetsize"
                selected={spec?.sheet}
                onChange={(l) => onChangeParameter("sheet", l)}
                layouts={layouts}
                label={getMessageById(context.messages, "print.sheetsize")}
            />
            {renderLayoutsAlternatives(alternatives || defaultAlternatives, context)}
        </>
    );
};

Layout.contextTypes = {
    messages: PropTypes.object
};

