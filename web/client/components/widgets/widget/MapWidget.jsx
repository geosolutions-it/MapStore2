/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const WidgetContainer = require('./WidgetContainer');
const InfoPopover = require('./InfoPopover');
const { omit } = require('lodash');
const Message = require('../../I18N/Message');
const {withHandlers} = require('recompose');
const MapView = withHandlers({
    onMapViewChanges: ({ updateProperty = () => { } }) => map => updateProperty('map', map)
})(require('./MapView'));

const {
    Glyphicon,
    ButtonToolbar,
    DropdownButton,
    MenuItem
} = require('react-bootstrap');


const renderHeaderLeftTopItem = ({ title, description } = {}) => {
    return description ? <InfoPopover placement="top" title={title} text={description} /> : null;
};

module.exports = ({
    onEdit = () => { },
    updateProperty = () => { },
    toggleDeleteConfirm = () => { },
    id, title, loading, description,
    map,
    mapStateSource,
    canEdit = true,
    confirmDelete = false,
    onDelete = () => {},
    headerStyle
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
        topLeftItems={renderHeaderLeftTopItem({ loading, title, description })}
        topRightItems={canEdit ? (<ButtonToolbar>
            <DropdownButton pullRight bsStyle="default" className="widget-menu" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
                <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil" />&nbsp;<Message msgId="widgets.widget.menu.edit" /></MenuItem>
                <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash" />&nbsp;<Message msgId="widgets.widget.menu.delete" /></MenuItem>
            </DropdownButton>
        </ButtonToolbar>) : null}
    >
        <MapView updateProperty={updateProperty} id={id} map={omit(map, 'mapStateSource')} mapStateSource={mapStateSource} layers={map && map.layers} options={{ style: { margin: 10, height: 'calc(100% - 20px)' }}}/>
    </WidgetContainer>);
