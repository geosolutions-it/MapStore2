/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const WidgetContainer = require('./WidgetContainer');

const Message = require('../../I18N/Message');
const autoMapType = require('../../map/enhancers/autoMapType');
const mapType = require('../../map/enhancers/mapType');
const autoResize = require('../../map/enhancers/autoResize');
const MMap = autoResize(2000)(autoMapType(mapType(require('../../map/BaseMap'))));

const MapView = () => (<MMap
    options={{ style: { margin: 10, height: 'calc(100% - 20px)' }}}
    layers={[{
    "id": "mapnik__1",
    "group": "background",
    "source": "osm",
    "name": "mapnik",
    "title": "Open Street Map",
    "type": "osm",
    "visibility": true,
    "singleTile": false,
    "dimensions": [],
    "hideLoading": false,
    "handleClickOnLayer": false
}]} />);
const {
    Glyphicon,
    ButtonToolbar,
    DropdownButton,
    MenuItem
} = require('react-bootstrap');

module.exports = ({
    onEdit = () => { },
    toggleDeleteConfirm = () => { },
    id, title,
    confirmDelete = false,
    onDelete = () => { }
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm}
        topRightItems={<ButtonToolbar>
            <DropdownButton pullRight bsStyle="default" className="widget-menu" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
                <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil" />&nbsp;<Message msgId="widgets.widget.menu.edit" /></MenuItem>
                <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash" />&nbsp;<Message msgId="widgets.widget.menu.delete" /></MenuItem>
            </DropdownButton>
        </ButtonToolbar>}
    >
    <MapView />
    </WidgetContainer>);
