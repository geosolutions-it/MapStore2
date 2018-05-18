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
const emptyTextState = require('../enhancers/emptyTextState');
const TextView = emptyTextState(({text} = {}) => <div className="mapstore-widget-default-content" dangerouslySetInnerHTML={{__html: text}}></div>);
const {
     Glyphicon,
     ButtonToolbar,
     DropdownButton,
     MenuItem
} = require('react-bootstrap');

module.exports = ({
    onEdit = () => {},
    toggleDeleteConfirm = () => {},
    id, title, text,
    headerStyle,
    canEdit = true,
    confirmDelete= false,
    onDelete=() => {}
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
    topRightItems={<ButtonToolbar>
        {canEdit ? (<DropdownButton pullRight bsStyle="default" className="widget-menu" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
            <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil"/>&nbsp;<Message msgId="widgets.widget.menu.edit" /></MenuItem>
            <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash"/>&nbsp;<Message msgId="widgets.widget.menu.delete" /></MenuItem>
        </DropdownButton>) : null}
    </ButtonToolbar>}
        >
    <TextView text={text} />
    </WidgetContainer>

);
