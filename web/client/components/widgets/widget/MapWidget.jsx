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

const MapView = ({id, map, layers = []}) => (<MMap
    id={id}
    options={{ style: { margin: 10, height: 'calc(100% - 20px)' }}}
    map={map}
    layers={layers} />);
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
    map,
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
        <MapView id={id} map={map} layers={map && map.layers}/>
    </WidgetContainer>);
