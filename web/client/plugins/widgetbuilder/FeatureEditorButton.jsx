import React from 'react';
import {connect} from 'react-redux';
import { createChart } from '../../actions/widgets';
import { selectedLayerSelector } from '../../selectors/featuregrid';
import { isWidgetLayerSupported } from '../../utils/WidgetsUtils';

import withHint from "../../components/data/featuregrid/enhancers/withHint";
import TButtonComp from "../../components/data/featuregrid/toolbars/TButton";
const TButton = withHint(TButtonComp);
const FeatureEditorButton = connect(
    (state) => ({
        supported: isWidgetLayerSupported(selectedLayerSelector(state))
    }),
    {
        onClick: () => createChart()
    }
)(({disabled, mode, supported, onClick = () => {}}) => {
    return (<TButton
        id="grid-map-chart"
        keyProp="grid-map-chart"
        tooltipId="featuregrid.toolbar.createNewChart"
        disabled={disabled}
        visible={mode === "VIEW" && supported}
        onClick={onClick}
        glyph="widgets"/>);
});

export default FeatureEditorButton;
