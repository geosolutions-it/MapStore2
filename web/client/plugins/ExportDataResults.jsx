/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon, Tooltip } from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';

import {
    removeExportDataResult,
    checkExportDataEntries
} from '../actions/exportdataresults';
import { toggleControl } from '../actions/controls';

import {
    exportDataResultsControlEnabledSelector,
    exportDataResultsSelector,
    showInfoBubbleSelector,
    infoBubbleMessageSelector,
    checkingExportDataEntriesSelector
} from '../selectors/exportdataresults';
import { currentLocaleSelector } from '../selectors/locale';

import Dialog from '../components/misc/Dialog';
import ExportDataResults from '../components/data/download/exportdataresults/ExportDataResults';
import InfoBubble from '../components/misc/infobubble/InfoBubble';
import DefaultInfoBubbleInner from '../components/misc/infobubble/DefaultInnerComponent';
import Message from '../components/I18N/Message';
import OverlayTrigger from '../components/misc/OverlayTrigger';

import * as epics from '../epics/exportdataresults';
import exportdataresults from '../reducers/exportdataresults';

import { createPlugin } from '../utils/PluginsUtils';

const ExportData = ({
    active = false,
    showInfoBubble = false,
    infoBubbleMessage = {},
    checkingExportDataEntries,
    results = [],
    currentLocale,
    onToggle = () => {},
    onActive = () => {},
    onRemoveResult
}) => {
    React.useEffect(() => {
        if (active) {
            onActive();
        }
    }, [active]);

    return (
        <>
            <div id="mapstore-export-data-results-button-container">
                <OverlayTrigger placement="left" overlay={<Tooltip id="mapstore-export-data-results-tooltip"><Message msgId="exportDataResults.title"/></Tooltip>}>
                    <Button
                        bsStyle="primary"
                        bsSize="small"
                        onClick={() => onToggle()}>
                        <Glyphicon glyph="download"/>
                    </Button>
                </OverlayTrigger>
                <InfoBubble
                    show={showInfoBubble}
                    className="mapstore-export">
                    <DefaultInfoBubbleInner {...infoBubbleMessage} />
                </InfoBubble>
            </div>
            <Dialog
                id="mapstore-export-data-results"
                style={{display: active ? "block" : "none"}}
                draggable={false}
                modal>
                <span role="header">
                    <span className="about-panel-title"><Message msgId="exportDataResults.title"/></span>
                    <button onClick={() => onToggle()} className="settings-panel-close close"><Glyphicon glyph="1-close"/></button>
                </span>
                <div role="body">
                    <ExportDataResults
                        loading={checkingExportDataEntries}
                        results={results}
                        currentLocale={currentLocale}
                        onRemoveResult={onRemoveResult}/>
                </div>
            </Dialog>
        </>
    );
};

const ExportDataResultsPlugin = createPlugin('ExportDataResults', {
    component: connect(createStructuredSelector({
        active: exportDataResultsControlEnabledSelector,
        showInfoBubble: showInfoBubbleSelector,
        infoBubbleMessage: infoBubbleMessageSelector,
        checkingExportDataEntries: checkingExportDataEntriesSelector,
        results: exportDataResultsSelector,
        currentLocale: currentLocaleSelector
    }), {
        onToggle: toggleControl.bind(null, 'exportDataResults', 'enabled'),
        onActive: checkExportDataEntries,
        onRemoveResult: removeExportDataResult
    })(ExportData),
    containers: {
        MapFooter: {
            name: "exportDataResults",
            priority: 1,
            position: 1,
            tool: true
        }
    },
    epics,
    reducers: {
        exportdataresults
    }
});

export default ExportDataResultsPlugin;
