/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col} = require('react-bootstrap');
const MailingLists = require('../components/home/MailingLists');

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

module.exports = {
    MailingListsPlugin
};
