/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';
import { Button, Glyphicon, Tooltip } from 'react-bootstrap';

import emptyState from '../../misc/enhancers/emptyState';
import OverlayTrigger from '../../misc/OverlayTrigger';
import Loader from '../../misc/Loader';
import Message from '../../I18N/Message';

import { getLayerTitle } from '../../../utils/LayersUtils';

const failButton = (
    <Button
        bsStyle="primary"
        bsSize="small"
        className="mapstore-exportdataresults-item-failed">
        <Glyphicon glyph="exclamation-sign"/>
    </Button>
);

const ExportDataResults = ({
    loading = false,
    results = [],
    currentLocale,
    onRemoveResult = () => {}
}) => loading ? <Loader size={100} style={{margin: '0 auto', padding: '10px'}}/> : (
    <div className="mapstore-exportdataresults-container">
        {results.map(({id, layerName, layerTitle, startTime, status, result}) => {
            const title = getLayerTitle({name: layerName, title: layerTitle}, currentLocale);
            const startDate = new Date(startTime);
            const pad = x => x < 10 ? `0${x}` : `${x}`;
            const startDateStr = `${pad(startDate.getDate())}/${pad(startDate.getMonth() + 1)}/${startDate.getFullYear()} ${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;

            return (
                <div key={id} className="mapstore-exportdataresults-item">
                    <div className="mapstore-exportdataresults-item-name">
                        {title}
                    </div>
                    <div className="mapstore-exportdataresults-item-date">
                        {startDateStr}
                    </div>
                    <div className="mapstore-exportdataresults-item-buttons">
                        {status === 'pending' && <Loader size={22} style={{marginLeft: '2px'}}/>}
                        {status === 'failed' && result && result.msgId ?
                            <OverlayTrigger placement="top" overlay={<Tooltip id="exportresults-failure-tooltip"><Message msgId={result.msgId} msgParams={result.msgParams}/></Tooltip>}>
                                {failButton}
                            </OverlayTrigger> : null}
                        {status === 'failed' && (!result || !result.msgId) ? failButton : null}
                        {status === 'completed' &&
                            <a href={result}>
                                <Button bsStyle="primary" bsSize="small">
                                    <Glyphicon glyph="floppy-disk"/>
                                </Button>
                            </a>}
                        <Button
                            bsStyle="primary"
                            bsSize="small"
                            onClick={() => onRemoveResult(id)}>
                            <Glyphicon glyph="trash"/>
                        </Button>
                    </div>
                </div>
            );
        })}
    </div>
);

export default emptyState(({results = []}) => !results.length, {
    title: <Message msgId="exportDataResults.emptyStateMessage"/>
})(ExportDataResults);
