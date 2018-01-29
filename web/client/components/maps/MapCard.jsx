/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const Message = require('../I18N/Message');
const GridCard = require('../misc/GridCard');
const thumbUrl = require('./style/default.jpg');
const assign = require('object-assign');
const ConfirmModal = require('./modals/ConfirmModal');
const LocaleUtils = require('../../utils/LocaleUtils');

require("./style/mapcard.css");

class MapCard extends React.Component {
    static propTypes = {
        // props
        style: PropTypes.object,
        map: PropTypes.object,
        detailsSheetActions: PropTypes.object,
        mapType: PropTypes.string,
        // CALLBACKS
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        onEdit: PropTypes.func,
        onMapDelete: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
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
        onEdit: ()=> {}
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
                backgroundImage: 'url(' + (this.props.map.thumbnail === null || this.props.map.thumbnail === "NODATA" ? thumbUrl : decodeURIComponent(this.props.map.thumbnail)) + ')'
            });
        }
        return this.props.style;
    };

    render() {
        let availableAction = [];
        if (this.props.map.canEdit === true) {
            availableAction.push(
                {
                    onClick: (evt) => {this.stopPropagate(evt); this.displayDeleteDialog(); },
                    glyph: "trash",
                    disabled: this.props.map.deleting,
                    loading: this.props.map.deleting,
                    tooltip: LocaleUtils.getMessageById(this.context.messages, "manager.deleteMap")
                }, {
                    onClick: (evt) => {
                        this.stopPropagate(evt);
                        this.onEdit(this.props.map, true);
                    },
                    glyph: "wrench",
                    disabled: this.props.map.updating,
                    loading: this.props.map.updating,
                    tooltip: LocaleUtils.getMessageById(this.context.messages, "manager.editMapMetadata")
                });
        }
        if (this.props.map.details && this.props.map.details !== "NODATA") {
            availableAction.push({
                onClick: (evt) => {
                    this.stopPropagate(evt);
                    this.onEdit(this.props.map, false);
                    this.props.detailsSheetActions.onToggleDetailsSheet(true);
                },
                glyph: "sheet",
                tooltip: LocaleUtils.getMessageById(this.context.messages, "map.details.show")
            });
        }
        return (
           <GridCard className="map-thumb" style={this.getCardStyle()} header={this.props.map.title || this.props.map.name}
                actions={availableAction} onClick={this.onClick}
               >
               <div className="map-thumb-description">{this.props.map.description}</div>
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
