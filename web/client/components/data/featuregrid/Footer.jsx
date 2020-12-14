/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Col, Glyphicon, Grid, Row } from 'react-bootstrap';
import Spinner from 'react-spinkit';

import Button from '../../misc/Button';
import { toPage } from '../../../utils/FeatureGridUtils';
import Message from '../../I18N/Message';

export default (props = {
    loading: false,
    onPageChange: () => {}
}) => {
    const {page = 0, size = 0, resultSize = 0, maxPages = 0, total = 0} = toPage(props);
    return (<Grid className="bg-body data-grid-bottom-toolbar" fluid style={{width: "100%"}}>
        <Row className="featuregrid-toolbar-margin">
            <Col md={3}>
                <span><Message msgId={props.virtualScroll && "featuregrid.resultInfoVirtual" || "featuregrid.resultInfo"} msgParams={{start: page * size + 1, end: page * size + resultSize, total, selected: props.selected ?? 0}} /></span>
                &nbsp;{props.selected > 0 ? <span><Message msgId="featuregrid.selectedInfo" msgParams={{ selected: props.selected ?? 0 }} /></span> : null}
            </Col>
            { !props.virtualScroll ? (<Col className="text-center" md={6}>
                <Button
                    key="first-page"
                    onClick={() => props.onPageChange(0)}
                    disabled={page === 0}
                    className="no-border first-page"><Glyphicon glyph="step-backward"/></Button>
                <Button
                    key="prev-page"
                    onClick={() => props.onPageChange(page - 1)}
                    disabled={page === 0}
                    className="no-border prev-page"><Glyphicon glyph="chevron-left"/></Button>
                <span key="page-info"><Message msgId="featuregrid.pageInfo" msgParams={{page: page + 1, totalPages: maxPages + 1}} /></span>
                <Button
                    key="next-page"
                    onClick={() => props.onPageChange(page + 1)}
                    className="no-border next-page"
                    disabled={page >= maxPages}
                ><Glyphicon glyph="chevron-right"/></Button>
                <Button
                    key="last-page"
                    onClick={() => props.onPageChange(maxPages)}
                    className="no-border last-page"
                    disabled={page >= maxPages}
                ><Glyphicon glyph="step-forward"/></Button>
            </Col>) : null} <Col md={3}>
                {props.loading ? <span style={{"float": "right"}} ><Message msgId="loading" /><Spinner spinnerName="circle" style={{"float": "right"}}noFadeIn/></span> : null}
            </Col>
        </Row></Grid>);
};
