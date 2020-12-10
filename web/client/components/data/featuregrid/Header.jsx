/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Col, Glyphicon, Grid, Row } from 'react-bootstrap';
import Button from '../../misc/Button';


export default (props = {
    onDownloadToggle: () => {}
}) => {
    return (<Grid className="bg-body data-grid-top-toolbar" fluid style={{width: "100%"}}>
        <Row className="flex-center">
            <Col xs={4}>
                {props.children}
            </Col>
            <Col xs={4}>
                <div className="text-center text-primary"><strong>{props.title}</strong></div>
            </Col>
            <Col xs={4}>
                <Button onClick={props.onClose} style={{"float": "right"}} className="square-button no-border featuregrid-top-toolbar-margin">
                    <Glyphicon glyph="1-close"/>
                </Button>
            </Col>
        </Row>
    </Grid>);
};
