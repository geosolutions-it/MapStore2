/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const WidgetContainer = require('./WidgetContainer');
const Message = require('../../I18N/Message');
const emptyLegendState = require('../enhancers/emptyLegendState');
const InfoPopover = require('./InfoPopover');

const LegendView = emptyLegendState()(require('./LegendView'));
const renderHeaderLeftTopItem = ({ title, description } = {}) => {
    return description ? <InfoPopover placement="top" title={title} text={description} /> : null;
};
const {
     Glyphicon,
     ButtonToolbar,
     DropdownButton,
     MenuItem
} = require('react-bootstrap');

module.exports = ({
    onEdit = () => {},
    toggleDeleteConfirm = () => {},
    id, title,
    headerStyle,
    confirmDelete= false,
    canEdit = true,
    onDelete=() => {},
    loading,
    description,
    ...props
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
    topLeftItems={renderHeaderLeftTopItem({ loading, title, description })}

    topRightItems={canEdit ? (<ButtonToolbar>
        <DropdownButton pullRight bsStyle="default" className="widget-menu" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
            <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil"/>&nbsp;<Message msgId="widgets.widget.menu.edit" /></MenuItem>
            <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash"/>&nbsp;<Message msgId="widgets.widget.menu.delete" /></MenuItem>
        </DropdownButton>
    </ButtonToolbar>) : null}
        >
        <LegendView {...props} />
    </WidgetContainer>

);
