/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Button, Col, Glyphicon } = require('react-bootstrap');
const Message = require('../../I18N/Message');

module.exports = ({onClose = () => {}} = {}) =>
(<div className="mapstore-flex-container">
<div className="m-header">
<div className="mapstore-block-width">
<Col xs={3} className="text-center" style={{overflow: 'hidden'}}/>

<Col xs={12} className="text-center" style={{overflow: 'hidden', lineHeight: '52px'}}>
     <Button onClick={() => onClose()} className="pull-left square-button no-border ">
        <Glyphicon glyph="1-close"/>
    </Button>
<span style={{padding: '50px 0 0 0', fontSize: 16}}><Message msgId="widgets.builder.header.title" /></span>
    <Button className="square-button pull-right no-border">
        <Glyphicon glyph="cog"/>
    </Button>
</Col>
<Col xs={3} className="text-center" style={{overflow: 'hidden'}}/>

</div>
<div className="mapstore-block-width text-center">
    <div className="m-padding-md">
    </div>
</div>
</div>
</div>
);
