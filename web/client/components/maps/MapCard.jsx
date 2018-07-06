/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const {get} = require('lodash');
const Message = require('../I18N/Message');
const GridCard = require('../misc/GridCard');
const FitIcon = require('../misc/FitIcon');

const thumbUrl = require('./style/default.jpg');
const assign = require('object-assign');
const ConfirmModal = require('./modals/ConfirmModal');

class MapCard extends React.Component {
    static propTypes = {
        // props
        style: PropTypes.object,
        map: PropTypes.object,
        showMapDetails: PropTypes.bool,
        detailsSheetActions: PropTypes.object,
        // CALLBACKS
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        onEdit: PropTypes.func,
        onMapDelete: PropTypes.func,
        onUpdateAttribute: PropTypes.func,
        backgroundOpacityStart: PropTypes.number,
        backgroundOpacityEnd: PropTypes.number,
        tooltips: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        showMapDetails: true,
        style: {
            backgroundImage: 'url(' + thumbUrl + ')',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "repeat-x"
        },
        detailsSheetActions: {
            onToggleDetailsSheet: () => {}
        },
        // CALLBACKS
        onMapDelete: ()=> {},
        onEdit: () => {},
        onUpdateAttribute: () => {},
        backgroundOpacityStart: 0.7,
        backgroundOpacityEnd: 0.3,
        tooltips: {
            deleteResource: "resources.resource.deleteResource",
            editResource: "resources.resource.editResource",
            addToFeatured: "resources.resource.addToFeatured",
            showDetails: "resources.resource.showDetails",
            removeFromFeatured: "resources.resource.removeFromFeatured"
        }
    };

    onEdit = (map, openModalProperties) => {
        this.props.onEdit(map, openModalProperties);
    };

    onConfirmDelete = () => {
        this.props.onMapDelete(this.props.map.id);
        this.close();
    };

    onClick = (evt) => {
        // Users can select Title and Description without triggering the click
        var selection = window.getSelection();
        if (!selection.toString()) {
            this.stopPropagate(evt);
            this.props.viewerUrl(this.props.map);
        }
    };

    getCardStyle = () => {
        if (this.props.map.thumbnail) {
            return assign({}, this.props.style, {
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, ' + this.props.backgroundOpacityStart + '), rgba(0, 0, 0, ' + this.props.backgroundOpacityEnd + ') ), url(' + (this.props.map.thumbnail === null || this.props.map.thumbnail === "NODATA" ? thumbUrl : decodeURIComponent(this.props.map.thumbnail)) + ')'
            });
        }
        return this.props.style;
    };

    render() {

        const isFeatured = this.props.map && this.props.map.featured === 'true' || this.props.map.featured === 'added';
        const availableAction = [
            {
                visible: this.props.map.canEdit === true,
                glyph: 'trash',
                disabled: this.props.map.deleting,
                loading: this.props.map.deleting,
                tooltipId: this.props.tooltips.deleteResource,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.displayDeleteDialog();
                }
            },
            {
                visible: this.props.map.canEdit === true && (get(this.props.map, "category.name") !== "DASHBOARD"),
                glyph: 'wrench',
                disabled: this.props.map.updating,
                loading: this.props.map.updating,
                tooltipId: 'manager.editMapMetadata',
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.onEdit(this.props.map, true);
                }
            },
            {
                visible: !!(this.props.showMapDetails && this.props.map.details && this.props.map.details !== 'NODATA'),
                glyph: 'sheet',
                tooltipId: this.props.tooltips.showDetails,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.onEdit(this.props.map, false);
                    this.props.detailsSheetActions.onToggleDetailsSheet(true);
                }
            },
            {
                visible: !!(this.props.map.canEdit === true && this.props.map.featuredEnabled),
                glyph: isFeatured ? 'star' : 'star-empty',
                bsStyle: isFeatured ? 'success' : 'primary',
                tooltipId: isFeatured ? this.props.tooltips.removeFromFeatured : this.props.tooltips.addToFeatured,
                onClick: evt => {
                    this.stopPropagate(evt);
                    this.props.onUpdateAttribute(this.props.map.id, 'featured', !isFeatured);
                }
            }
        ];

        return (
           <GridCard className="map-thumb" style={this.getCardStyle()} header={this.props.map.title || this.props.map.name}
                actions={availableAction} onClick={this.onClick}
               >
               <div className="map-thumb-description">{this.props.map.description}</div>
                {this.props.map.icon ?
                    <div key="icon" style={{
                        width: "20px",
                        height: "20px",
                        margin: "5px 10px",
                        color: "white",
                        position: "absolute",
                        bottom: 0,
                        left: 0 }} >
                        <FitIcon glyph={this.props.map.icon} />
                    </div> : null}
               <ConfirmModal ref="deleteMapModal" show={this.state ? this.state.displayDeleteDialog : false} onHide={this.close} onClose={this.close} onConfirm={this.onConfirmDelete} titleText={<Message msgId="manager.deleteMap" />} confirmText={<Message msgId="manager.deleteMap" />} cancelText={<Message msgId="cancel" />} body={<Message msgId="manager.deleteMapMessage" />} />
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

module.exports = MapCard;
