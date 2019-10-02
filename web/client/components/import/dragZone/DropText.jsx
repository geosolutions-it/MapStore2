/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Button} = require('react-bootstrap');
const Message = require('../../I18N/Message');
const HTML = require('../../I18N/HTML');

module.exports = ({
    openFileDialog
}) => (<div>
    <HTML msgId="mapImport.dropZone.heading" />
    {openFileDialog
        ? <Button bsStyle="primary" onClick={openFileDialog}><Message msgId="mapImport.dropZone.selectFiles" /></Button>
        : null
    }
    <br />
    <br />
    <HTML msgId="mapImport.dropZone.infoSupported" />
    <hr />
    <HTML msgId="mapImport.dropZone.note" />
</div>);
