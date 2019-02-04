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
    updateProperty = () => { },
    toggleDeleteConfirm = () => { },
    id, title, loading, description,
    map,
    mapStateSource,
    topRightItems,
    confirmDelete = false,
    onDelete = () => {},
    headerStyle
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
        topLeftItems={renderHeaderLeftTopItem({ loading, title, description })}
        topRightItems={topRightItems}
    >
        <MapView updateProperty={updateProperty} id={id} map={omit(map, 'mapStateSource')} mapStateSource={mapStateSource} layers={map && map.layers} options={{ style: { margin: 10, height: 'calc(100% - 20px)' }}}/>
    </WidgetContainer>);
