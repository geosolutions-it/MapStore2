import React from 'react';
import {connect} from 'react-redux';
import { createChart } from '../../actions/widgets';

import withHint from "../../components/data/featuregrid/enhancers/withHint";
import TButtonComp from "../../components/data/featuregrid/toolbars/TButton";
const TButton = withHint(TButtonComp);
const FeatureEditorButton = connect(
    () => ({}),
    {
        onClick: () => createChart()
    }
)(({disabled, mode, onClick = () => {}}) => {
    return (<TButton
        id="grid-map-chart"
        keyProp="grid-map-chart"
        tooltipId="featuregrid.toolbar.createNewChart"
        disabled={disabled}
        visible={mode === "VIEW"}
        onClick={onClick}
        glyph="stats"/>);
});

export default FeatureEditorButton;
