/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const ConfirmDialog = require('../../misc/ConfirmDialog');
const Message = require('../../I18N/Message');

/**
 * Annotations panel component. Currently handles the removal confirm panel.
 * We will add the annotations cards UI.
 * @memberof components.mapControls.annotations
 * @class
 * @prop {boolean} editing flag that means we are currently in editing mode
 * @prop {object} removing object to remove, it is also a flag that means we are currently asking for removing an annotation / geometry. Toggles visibility of the confirm dialog
 * @prop {function} onCancelRemove triggered when the user cancels removal
 * @prop {function} onConfirmRemove triggered when the user confirms removal
 *
 */
class Annotations extends React.Component {
    static propTypes = {
        editing: PropTypes.bool,
        removing: PropTypes.object,
        onCancelRemove: PropTypes.func,
        onConfirmRemove: PropTypes.func
    };

    render() {
        if (this.props.removing) {
            return (<ConfirmDialog
                show
                modal
                onClose={this.props.onCancelRemove}
                onConfirm={() => this.props.onConfirmRemove(this.props.removing)}
                confirmButtonBSStyle="default"
                closeGlyph="1-close"
                confirmButtonContent={<Message msgId="annotations.confirm" />}
                closeText={<Message msgId="annotations.cancel" />}>
                <Message msgId={this.props.editing ? "annotations.removegeometry" : "annotations.removeannotation"}/>
                </ConfirmDialog>);
        }
        return null;
    }
}

module.exports = Annotations;
