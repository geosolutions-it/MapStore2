/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import Examples from '../components/home/Examples';
import MailingLists from '../components/home/MailingLists';

class ExamplesPlugin extends React.Component {
    render() {
        return (<Grid fluid>
            <Row className="show-grid">
                <Col xs={12} lg={6}>
                    <Examples/>
                </Col>
                <Col xs={12} lg={6}>
                    <MailingLists/>
                </Col>
            </Row>
        </Grid>)
        ;
    }
}

export default {
    ExamplesPlugin: ExamplesPlugin
};
