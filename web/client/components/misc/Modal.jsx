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

/**
 * this allows to stop click event propagation in portals, passing the original
 * click event to the onHide handler.
 * Useful if you want to use a portal inside a component with a `onClick method defined`.
 */
class FixedModal extends Modal {
    handleDialogClick(e) {
        if (e.target !== e.currentTarget) {
            return;
        }
        this.props.onHide(e);
    }
}

const assign = require('object-assign');

module.exports = assign(withContainer(FixedModal), {
    Body: Modal.Body,
    Dialog: Modal.Dialog,
    Footer: Modal.Footer,
    Header: Modal.Header,
    Title: Modal.Title
});
