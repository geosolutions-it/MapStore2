/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const Message = require('../I18N/Message');
const GridCard = require('../misc/GridCard');
const thumbUrl = require('../maps/style/default.jpg');
const assign = require('object-assign');
const ConfirmModal = require('./modals/ConfirmModal');

class ResourceCard extends React.Component {
    static propTypes = {
        // props
        style: PropTypes.object,
        backgroundOpacityStart: PropTypes.number,
        backgroundOpacityEnd: PropTypes.number,
        resource: PropTypes.object,
        // CALLBACKS
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        onEdit: PropTypes.func,
        onDelete: PropTypes.func,
        onUpdateAttribute: PropTypes.func,
        tooltips: PropTypes.object


    };

    static defaultProps = {
        resource: {},
        style: {
            backgroundImage: 'url(' + thumbUrl + ')',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "repeat-x"
        },
        backgroundOpacityStart: 0.7,
        backgroundOpacityEnd: 0.3,
        tooltips: {
            deleteResource: "resources.resource.deleteResource",
            editResource: "resources.resource.editResource",
            addToFeatured: "resources.resource.addToFeatured",
            showDetails: "resources.resource.showDetails",
            removeFromFeatured: "resources.resource.removeFromFeatured"
        },
        // CALLBACKS
        onDelete: () => { },
        onEdit: () => { },
        onUpdateAttribute: () => { }

    };

    onEdit = (resource, openModalProperties) => {
        this.props.onEdit(resource, openModalProperties);
    };

    onConfirmDelete = () => {
        this.props.onDelete(this.props.resource.id);
        this.close();
    };

    onClick = (evt) => {
        // Users can select Title and Description without triggering the click
        var selection = window.getSelection();
        if (!selection.toString()) {
            this.stopPropagate(evt);
            this.props.viewerUrl(this.props.resource);
        }
    };

    getCardStyle = () => {
        if (this.props.resource.thumbnail) {
            return assign({}, this.props.style, {
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, ' + this.props.backgroundOpacityStart + '), rgba(0, 0, 0, ' + this.props.backgroundOpacityEnd + ') ), url(' + (this.props.resource.thumbnail === null || this.props.resource.thumbnail === "NODATA" ? thumbUrl : decodeURIComponent(this.props.resource.thumbnail)) + ')'
            });
        }
        return this.props.style;
    };

    render() {

        const isFeatured = this.props.resource && (this.props.resource.featured === 'true' || this.props.resource.featured === 'added');
        const availableAction = [
            {
                visible: this.props.resource.canEdit === true,
                glyph: 'trash',
                disabled: this.props.resource.deleting,
                loading: this.props.resource.deleting,
                tooltipId: this.props.tooltips.deleteResource,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.displayDeleteDialog();
                }
            },
            {
                visible: this.props.resource.canEdit === true,
                glyph: 'wrench',
                disabled: this.props.resource.updating,
                loading: this.props.resource.updating,
                tooltipId: this.props.tooltips.editResource,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.onEdit(this.props.resource, true);
                }
            },
            {
                visible: !!(this.props.resource.details && this.props.resource.details !== 'NODATA'),
                glyph: 'sheet',
                tooltipId: this.props.tooltips.showDetails,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.onEdit(this.props.resource, false);
                    // TODO show details
                }
            },
            {
                visible: !!(this.props.resource.canEdit === true && this.props.resource.featuredEnabled),
                glyph: isFeatured ? 'star' : 'star-empty',
                bsStyle: isFeatured ? 'success' : 'primary',
                tooltipId: isFeatured ? this.props.tooltips.removeFromFeatured : this.props.tooltips.addToFeatured,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.props.onUpdateAttribute(this.props.resource.id, 'featured', !isFeatured);
                }
            }
        ];

        return (
            <GridCard className="map-thumb" style={this.getCardStyle()} header={this.props.resource.title || this.props.resource.name}
                actions={availableAction} onClick={this.onClick}
            >
                <div className="map-thumb-description">{this.props.resource.description}</div>
                <ConfirmModal
                    show={this.state ? this.state.displayDeleteDialog : false}
                    onHide={this.close}
                    onClose={this.close}
                    onConfirm={this.onConfirmDelete}
                    title={<Message msgId="resources.deleteConfirmTitle" />}
                    confirmText={<Message msgId="resources.deleteConfirmButtonText" />}
                    cancelText={<Message msgId="resources.deleteCancelButtonText" />}>
                    <Message msgId="resources.deleteConfirmMessage" />
                </ConfirmModal>
            </GridCard>
        );
    }

    stopPropagate = (event) => {
        // prevent click on parent container
        const e = event || window.event || {};
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    };

    close = () => {
        // TODO Launch an action in order to change the state
        this.setState({
            displayDeleteDialog: false
        });
    };

    displayDeleteDialog = () => {
        this.setState({
            displayDeleteDialog: true
        });
    };
}

module.exports = ResourceCard;
