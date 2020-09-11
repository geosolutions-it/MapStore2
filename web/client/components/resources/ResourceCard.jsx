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
const FitIcon = require('../misc/FitIcon');
const thumbUrl = require('../maps/style/default.jpg');
const assign = require('object-assign');
const ConfirmModal = require('../misc/ResizableModal');

class ResourceCard extends React.Component {
    static propTypes = {
        // props
        style: PropTypes.object,
        backgroundOpacityStart: PropTypes.number,
        backgroundOpacityEnd: PropTypes.number,
        resource: PropTypes.object,
        editDataEnabled: PropTypes.bool,
        shareToolEnabled: PropTypes.bool,
        // CALLBACKS
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        onEdit: PropTypes.func,
        onEditData: PropTypes.func,
        onDelete: PropTypes.func,
        onShare: PropTypes.func,
        onShowDetailsSheet: PropTypes.func,
        onUpdateAttribute: PropTypes.func,
        tooltips: PropTypes.object
    };

    static defaultProps = {
        resource: {},
        editDataEnabled: false,
        shareToolEnabled: true,
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
            editResourceData: "resources.resource.editResourceData",
            addToFeatured: "resources.resource.addToFeatured",
            showDetails: "resources.resource.showDetails",
            shareResource: "share.title",
            removeFromFeatured: "resources.resource.removeFromFeatured"
        },
        // CALLBACKS
        onDelete: () => { },
        onEdit: () => { },
        onEditData: () => { },
        onShare: () => { },
        onShowDetailsSheet: () => { },
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
        if (this.props.resource.thumbnail && this.props.resource.thumbnail !== "NODATA") {
            return assign({}, this.props.style, {
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, '
                    + this.props.backgroundOpacityStart + '), rgba(0, 0, 0, '
                    + this.props.backgroundOpacityEnd
                    + ') ), url('
                    + (this.props.resource.thumbnail === null
                        ? thumbUrl
                        // this decode is for old thumbnails `rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` new are `rest/geostore/data/2/raw?decode=datauri`, so not needed
                        : decodeURIComponent(this.props.resource.thumbnail)
                    )
                    + ')'
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
                visible: this.props.resource.canEdit === true && this.props.editDataEnabled === true,
                glyph: 'pencil',
                disabled: this.props.resource.updating,
                loading: this.props.resource.updating,
                tooltipId: this.props.tooltips.editResourceData,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.props.onEditData(this.props.resource);
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
                visible: this.props.shareToolEnabled === true,
                glyph: 'share-alt',
                disabled: this.props.resource && this.props.resource.updating,
                loading: this.props.resource && this.props.resource.updating,
                tooltipId: this.props.tooltips.shareResource,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.props.onShare(this.props.resource);
                }
            },
            {
                visible: !!(this.props.resource.details && this.props.resource.details !== 'NODATA'),
                glyph: 'sheet',
                tooltipId: this.props.tooltips.showDetails,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.props.onShowDetailsSheet(this.props.resource);
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
            <div>
                <GridCard className="map-thumb" style={this.getCardStyle()} header={this.props.resource.title || this.props.resource.name}
                    actions={availableAction} onClick={this.onClick}
                >
                    <div className="map-thumb-description">{this.props.resource.description}</div>
                    {this.props.resource.icon ?
                        <div key="icon" style={{
                            width: "20px",
                            height: "20px",
                            margin: "5px 10px",
                            color: "white",
                            position: "absolute",
                            bottom: 0,
                            left: 0
                        }} >
                            <FitIcon glyph={this.props.resource.icon} />
                        </div> : null}
                </GridCard>
                <ConfirmModal
                    show={this.state ? this.state.displayDeleteDialog : false}
                    onClose={this.close}
                    title={this.props.resource.title || this.props.resource.name || <Message msgId="resources.deleteConfirmTitle" />}
                    buttons={[{
                        bsStyle: "primary",
                        text: <Message msgId="yes" />,
                        onClick: this.onConfirmDelete
                    }, {
                        text: <Message msgId="no" />,
                        onClick: this.close
                    }]}
                    fitContent
                >
                    <div className="ms-detail-body">
                        <Message msgId="resources.deleteConfirmMessage" />
                    </div>
                </ConfirmModal>
            </div>
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
