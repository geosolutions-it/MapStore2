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
    loading = false,
    showPreview = false,
    editDetailsDisabled,
    detailsText,
    settings = {},
    canUndo = false,
    onShowPreview = () => {},
    onHidePreview = () => {},
    onUndo = () => {},
    onShowDetailsSheet = () => {},
    onUpdate = () => {},
    onUpdateResource = () => {},
    onDelete = () => {}
}) => {
    return (
        <div className={"ms-section" + (showPreview ? ' ms-transition' : '')}>
            <div className="mapstore-block-width">
                <Row>
                    <Col xs={6}>
                        <div className="m-label">
                            {!loading && isNil(detailsText) ? <Message msgId="map.details.add" /> : <Message msgId="map.details.rowTitle" />}
                        </div>
                    </Col>
                    <Col xs={6}>
                        <div className="ms-details-sheet">
                            <div className="pull-right">
                                {loading ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : null}
                                {!loading && <Toolbar
                                    btnDefaultProps={{ className: 'square-button-md no-border' }}
                                    buttons={[
                                        {
                                            glyph: showPreview ? 'eye-open' : 'eye-close',
                                            visible: !!detailsText,
                                            onClick: () => showPreview ? onHidePreview() : onShowPreview(),
                                            disabled: loading,
                                            tooltipId: !showPreview ? "map.details.showPreview" : "map.details.hidePreview"
                                        }, {
                                            glyph: 'undo',
                                            tooltipId: "map.details.undo",
                                            visible: canUndo,
                                            onClick: () => onUndo(),
                                            disabled: loading
                                        }, {
                                            glyph: 'pencil-add',
                                            tooltipId: "map.details.add",
                                            visible: !detailsText,
                                            onClick: () => {
                                                onShowDetailsSheet();
                                                onUpdate();
                                            },
                                            disabled: loading
                                        }, {
                                            glyph: 'pencil',
                                            tooltipId: "map.details.edit",
                                            visible: !!detailsText && !editDetailsDisabled,
                                            onClick: () => {
                                                onShowDetailsSheet();
                                                onUpdate(detailsText);
                                            },
                                            disabled: loading
                                        }, {
                                            glyph: 'new-window',
                                            tooltipId: 'map.details.showAsModal',
                                            visible: !!detailsText,
                                            bsStyle: settings.showAsModal ? 'success' : 'default',
                                            onClick: () => onUpdateResource('attributes.detailsSettings.showAsModal', !settings.showAsModal)
                                        }, {
                                            glyph: 'pushpin',
                                            tooltipId: 'map.details.showAtStartup',
                                            visible: !!detailsText,
                                            bsStyle: settings.showAtStartup ? 'success' : 'default',
                                            onClick: () => onUpdateResource('attributes.detailsSettings.showAtStartup', !settings.showAtStartup)
                                        }, {
                                            glyph: 'trash',
                                            tooltipId: "map.details.delete",
                                            visible: !!detailsText,
                                            onClick: () => onDelete(),
                                            disabled: loading
                                        }]} />}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            {detailsText && <div className="ms-details-preview-container">
                {detailsText !== '' ? <div className="ms-details-preview" dangerouslySetInnerHTML={{ __html: detailsText }} />
                    : <div className="ms-details-preview"> <Message msgId="maps.feedback.noDetailsAvailable" /></div>}
            </div>}
        </div>
    );
};
