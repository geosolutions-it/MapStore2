import React from 'react';
import withHint from "../featuregrid/enhancers/withHint";
import TButtonComp from "../featuregrid/toolbars/TButton";
const TButton = withHint(TButtonComp);

export default ({disabled, results = [], mode, isDownloadOpen, onClick = () => {}}) => <TButton
    id="download-grid"
    keyProp="download-grid"
    tooltipId="featuregrid.toolbar.downloadGridData"
    disabled={disabled || results.length === 0}
    active={isDownloadOpen}
    visible={mode === "VIEW"}
    onClick={onClick}
    glyph="download"/>;
