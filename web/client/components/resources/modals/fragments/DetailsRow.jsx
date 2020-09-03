/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Spinner from 'react-spinkit';
import { isNil } from 'lodash';
import Toolbar from '../../../misc/toolbar/Toolbar';

import Message from '../../../I18N/Message';


export default ({
    resource = {},
    showPreview = false,
    editDetailsDisabled,
    detailsText,
    canUndo = false,
    onShowPreview = () => {},
    onHidePreview = () => {},
    onUndo = () => {},
    onShowDetailsSheet = () => {},
    onUpdate = () => {},
    onDelete = () => {}
}) => {
    return (
        <div className={"ms-section" + (showPreview ? ' ms-transition' : '')}>
            <div className="mapstore-block-width">
                <Row>
                    <Col xs={6}>
                        <div className="m-label">
                            {detailsText === 'NODATA' ? <Message msgId="map.details.add" /> : <Message msgId="map.details.rowTitle" />}
                        </div>
                    </Col>
                    <Col xs={6}>
                        <div className="ms-details-sheet">
                            <div className="pull-right">
                                {resource.saving ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : null}
                                {isNil(detailsText) ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : <Toolbar
                                    btnDefaultProps={{ className: 'square-button-md no-border' }}
                                    buttons={[
                                        {
                                            glyph: showPreview ? 'eye-open' : 'eye-close',
                                            visible: detailsText !== 'NODATA',
                                            onClick: () => showPreview ? onHidePreview() : onShowPreview(),
                                            disabled: resource.saving,
                                            tooltipId: !showPreview ? "map.details.showPreview" : "map.details.hidePreview"
                                        }, {
                                            glyph: 'undo',
                                            tooltipId: "map.details.undo",
                                            visible: canUndo,
                                            onClick: () => onUndo(),
                                            disabled: resource.saving
                                        }, {
                                            glyph: 'pencil-add',
                                            tooltipId: "map.details.add",
                                            visible: detailsText === 'NODATA',
                                            onClick: () => {
                                                onShowDetailsSheet();
                                            },
                                            disabled: resource.saving
                                        }, {
                                            glyph: 'pencil',
                                            tooltipId: "map.details.edit",
                                            visible: detailsText !== 'NODATA' && !editDetailsDisabled,
                                            onClick: () => {
                                                onShowDetailsSheet();
                                                if (detailsText) {
                                                    onUpdate(detailsText);
                                                }
                                            },
                                            disabled: resource.saving
                                        }, {
                                            glyph: 'trash',
                                            tooltipId: "map.details.delete",
                                            visible: detailsText !== 'NODATA',
                                            onClick: () => onDelete(),
                                            disabled: resource.saving
                                        }]} />}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            {detailsText && <div className="ms-details-preview-container">
                {detailsText !== 'NODATA' ? <div className="ms-details-preview" dangerouslySetInnerHTML={{ __html: detailsText }} />
                    : <div className="ms-details-preview"> <Message msgId="maps.feedback.noDetailsAvailable" /></div>}
            </div>}
        </div>
    );
};
