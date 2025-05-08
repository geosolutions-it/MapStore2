/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Button, Tooltip, Glyphicon } from 'react-bootstrap';

import Dialog from '../../misc/Dialog';
import Portal from '../../misc/Portal';
import ExportDataResults from './ExportDataResults';
import InfoBubble from '../../misc/infobubble/InfoBubble';
import DefaultInfoBubbleInner from '../../misc/infobubble/DefaultInnerComponent';
import Message from '../../I18N/Message';
import OverlayTrigger from '../../misc/OverlayTrigger';

const ExportDataResultsComponent = ({
    active = false,
    showInfoBubble = false,
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

    const infoMsg = {msgId: 'layerdownload.exportResultsMessages.exportFailure', level: "success"};

    return (
        <>
            {/* {results.length > 0*/ true ? <div id="mapstore-export-data-results-button-container"> */}
                <OverlayTrigger placement="left" overlay={<Tooltip id="mapstore-export-data-results-tooltip"><Message msgId="exportDataResults.title"/></Tooltip>}>
                    <Button
                        bsStyle="primary"
                        bsSize="small"
                        onClick={() => onToggle()}>
                        <Glyphicon glyph="download"/>
                    </Button>
                </OverlayTrigger>
                {/* TODO refect replace with other Comp */}
                <InfoBubble
                    show={showInfoBubble}
                    className="mapstore-export">
                    <DefaultInfoBubbleInner {...infoMsg} />
                </InfoBubble>
            </div> : null}
            {/* Portal must be contained in a valid node tag not in <></> */}
            <div>
                {active && <Portal>
                    <Dialog
                        id="mapstore-export-data-results"
                        draggable={false}
                        modal>
                        <span role="header">
                            <span className="modal-title about-panel-title"><Message msgId="exportDataResults.title"/></span>
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
                </Portal>}
            </div>
        </>
    );
};

export default ExportDataResultsComponent;
