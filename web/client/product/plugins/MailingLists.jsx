/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import MailingLists from '../components/home/MailingLists';

/**
 * MailingLists section of MapStore home page.
 * @name MailingLists
 * @class
 * @memberof plugins
 */
class MailingListsPlugin extends React.Component {
    render() {
        return (<Grid>
            <Row>
                <Col xs={12}>
                    <MailingLists/>
                </Col>
            </Row>
        </Grid>);
    }
}

export default {
    MailingListsPlugin
};
