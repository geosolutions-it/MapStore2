import React from 'react';
import Button from '../featuregrid/toolbars/TButton';


export default ({disabled, results = [], mode, isDownloadOpen, onClick = () => {}}) => <Button
    id="download-grid"
    keyProp="download-grid"
    tooltipId="featuregrid.toolbar.downloadGridData"
    disabled={disabled || results.length === 0}
    active={isDownloadOpen}
    visible={mode === "VIEW"}
    onClick={onClick}
    glyph="download"/>;
