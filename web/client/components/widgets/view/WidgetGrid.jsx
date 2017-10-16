/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const Message = require('../../I18N/Message');
const emptyStateView = require('../../misc/enhancers/emptyState');
const {Button, Grid, Row, Col} = require('react-bootstrap');

const enhanceWidgetList = emptyStateView(
    ({children = []} = {}) => children.length === 0,
    {
        title: <Message msgId="widgets.noWidgetsTitle" />,
        description: <Message msgId="widgets.noWidgetsDescription" />,
        content: <Button><Message msgId="widgets.addAWidgets" /></Button>
    }
);
module.exports = enhanceWidgetList(({children=[]}) =>
            (<Grid fluid>
                <Row>
                    <Col xs={12}>
                        {children}
                    </Col>
                </Row>
            </Grid>));
