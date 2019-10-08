/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const withContainer = require('./WithContainer');
const {Modal} = require('react-bootstrap');

/**
  * This allow do disable event propagation if used
  * in Portal inside a component with a `onClick` method (e.g. a button)
  * but you don't want events to be propagated to the container.
  * adding the event to `onHide` method, you can customize the handler
  * stopping event propagation manually.
  *
  * See [this](https://github.com/facebook/react/issues/11387) and [this](https://reactjs.org/docs/portals.html#event-bubbling-through-portals)
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
