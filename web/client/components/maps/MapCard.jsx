/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Message = require('../I18N/Message');
const GridCard = require('../misc/GridCard');
const thumbUrl = require('./style/default.png');
const assign = require('object-assign');

const ConfirmModal = require('./modals/ConfirmModal');


require("./style/mapcard.css");

const MapCard = React.createClass({
    propTypes: {
        // props
        style: React.PropTypes.object,
        map: React.PropTypes.object,
        currentMap: React.PropTypes.object,
        mapType: React.PropTypes.string,
        // CALLBACKS
        viewerUrl: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
        onEdit: React.PropTypes.func,
        onSaveMap: React.PropTypes.func,
        onSave: React.PropTypes.func,
        onSaveAll: React.PropTypes.func,
        onDisplayMetadataEdit: React.PropTypes.func,
        onRemoveThumbnail: React.PropTypes.func,
        onErrorCurrentMap: React.PropTypes.func,
        onUpdateCurrentMap: React.PropTypes.func,
        onCreateThumbnail: React.PropTypes.func,
        onDeleteThumbnail: React.PropTypes.func,
        onMapDelete: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            style: {
                backgroundImage: 'url(' + thumbUrl + ')',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "repeat-x"
            },
            // CALLBACKS
            onMapDelete: ()=> {},
            onCreateThumbnail: ()=> {},
            onDeleteThumbnail: ()=> {},
            onErrorCurrentMap: ()=> {},
            onUpdateCurrentMap: ()=> {},
            onEdit: ()=> {},
            onDisplayMetadataEdit: ()=> {},
            onSaveAll: () => {},
            onRemoveThumbnail: ()=> {},
            onSave: ()=> {},
            onSaveMap: () => {}
        };
    },
    getInitialState() {
        return {
            displayMetadataEdit: false
        };
    },
    onEdit: function(map) {
        this.props.onEdit(map);
    },
    onConfirmDelete() {
        this.props.onMapDelete(this.props.map.id);
        this.close();
    },
    onClick(evt) {
        // Users can select Title and Description without triggering the click
        var selection = window.getSelection();
        if (!selection.toString()) {
            this.stopPropagate(evt);
            this.props.viewerUrl(this.props.map);
        }
    },
    getCardStyle() {
        if (this.props.map.thumbnail) {
            return assign({}, this.props.style, {
                // TODO check the following code added: this.props.map.thumbnail === null ||
                backgroundImage: 'url(' + (this.props.map.thumbnail === null || this.props.map.thumbnail === "NODATA" ? thumbUrl : decodeURIComponent(this.props.map.thumbnail)) + ')'
            });
        }
        return this.props.style;
    },
    render: function() {
        var availableAction = [{
            onClick: (evt) => {this.stopPropagate(evt); this.props.viewerUrl(this.props.map); },
            glyph: "chevron-right",
            tooltip: <Message msgId="manager.openInANewTab" />
        }];

        if (this.props.map.canEdit === true) {
            availableAction.push({
                 onClick: (evt) => {this.stopPropagate(evt); this.onEdit(this.props.map); },
                 glyph: "wrench",
                 disabled: this.props.map.updating,
                 loading: this.props.map.updating,
                 tooltip: <Message msgId="manager.editMapMetadata" />
         }, {
                 onClick: (evt) => {this.stopPropagate(evt); this.displayDeleteDialog(); },
                 glyph: "remove-circle",
                 disabled: this.props.map.deleting,
                 loading: this.props.map.deleting,
                 tooltip: <Message msgId="manager.deleteMap" />
         });
        }
        return (
           <GridCard className="map-thumb" style={this.getCardStyle()} header={this.props.map.title || this.props.map.name}
                actions={availableAction} onClick={this.onClick}
               >
               <div className="map-thumb-description">{this.props.map.description}</div>
               <ConfirmModal ref="deleteMapModal" show={this.state.displayDeleteDialog} onHide={this.close} onClose={this.close} onConfirm={this.onConfirmDelete} titleText={<Message msgId="manager.deleteMap" />} confirmText={<Message msgId="manager.deleteMap" />} cancelText={<Message msgId="cancel" />} body={<Message msgId="manager.deleteMapMessage" />} />
           </GridCard>
        );
    },
    stopPropagate(event) {
        // prevent click on parent container
        const e = event || window.event || {};
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    },
    close() {
        // When the modal is closed the state of currentMap is restored to the initial situation
        this.props.onUpdateCurrentMap([], this.props.map && this.props.map.thumbnail);
        this.props.onErrorCurrentMap([], this.props.map && this.props.map.id);
        // TODO Launch an action in order to change the state
        this.setState({
            displayMetadataEdit: false,
            displayDeleteDialog: false
        });
    },
    open() {
        this.props.onDisplayMetadataEdit(true);
        this.setState({
            displayMetadataEdit: true
        });
    },
    displayDeleteDialog() {
        this.setState({
            displayDeleteDialog: true
        });
    }
});

module.exports = MapCard;
