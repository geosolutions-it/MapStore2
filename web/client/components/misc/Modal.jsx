/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root dir
 ectory of this source tree.
 */

const withContainer = require('./WithContainer');
const {Modal} = require('react-bootstrap');
const assign = require('object-assign');

module.exports = assign(withContainer(Modal), {
    Body: Modal.Body,
    Dialog: Modal.Dialog,
    Footer: Modal.Footer,
    Header: Modal.Header,
    Title: Modal.Title
});
