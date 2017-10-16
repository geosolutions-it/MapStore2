 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');

const {Button, Glyphicon, Row, Col} = require('react-bootstrap');

module.exports = () => (<div style={{
    overflow: 'hidden'
}}>
    <Row>
        <Col xs={12}>
            <Button className="pull-left square-button">
                <Glyphicon glyph="cog"/>
                Widgets
            </Button>
            <Button className="pull-right square-button">
                <Glyphicon glyph="1-close"/>
            </Button>
        </Col>
    </Row>
</div>);
