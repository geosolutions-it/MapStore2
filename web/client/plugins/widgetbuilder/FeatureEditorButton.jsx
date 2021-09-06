import React from 'react';
import {connect} from 'react-redux';
import { createChart } from '../../actions/widgets';

import Button from '../../components/data/featuregrid/toolbars/TButton';
const FeatureEditorButton = connect(
    () => ({}),
    {
        onClick: () => createChart()
    }
)(({disabled, mode, onClick = () => {}}) => {
    return (<Button
        id="grid-map-chart"
        keyProp="grid-map-chart"
        tooltipId="featuregrid.toolbar.createNewChart"
        disabled={disabled}
        visible={mode === "VIEW"}
        onClick={onClick}
        glyph="stats"/>);
});

export default FeatureEditorButton;
