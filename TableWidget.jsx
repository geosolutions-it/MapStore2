/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../I18N/Message');
const loadingState = require('../../misc/enhancers/loadingState');
const FeatureGrid = loadingState(({ describeFeatureType }) => !describeFeatureType)(require('../../data/featuregrid/FeatureGrid'));
const InfoPopover = require('./InfoPopover');

const WidgetContainer = require('./WidgetContainer');
const {
    Glyphicon,
    ButtonToolbar,
    DropdownButton,
    MenuItem
} = require('react-bootstrap');

const renderHeaderLeftTopItem = ({ title, description }) => {
    return title || description ? <InfoPopover placement="top" title={title} text={description} /> : null;
};


module.exports = ({
    id,
    title,
    description,
    loading,
    confirmDelete = false,
    toggleTableView = () => { },
    toggleDeleteConfirm = () => { },
    exportCSV = () => { },
    onEdit = () => { },
    onDelete = () => { },
    pageEvents = {
        moreFeatures: () => {}
    },
    describeFeatureType,
    features,
    size,
    pages,
    pagination = {},
    virtualScroll = true
}) =>
    (<WidgetContainer
        id={`widget-chart-${id}`}
        title={title}
        topLeftItems={renderHeaderLeftTopItem({ loading, title, description, toggleTableView })}
        confirmDelete={confirmDelete}
        onDelete={onDelete}
        toggleDeleteConfirm={toggleDeleteConfirm}
        topRightItems={<ButtonToolbar>
            <DropdownButton pullRight bsStyle="default" className="widget-menu" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
                <MenuItem onClick={() => toggleTableView()} eventKey="1"><Glyphicon glyph="features-grid" />&nbsp;<Message msgId="widgets.widget.menu.showChartData" /></MenuItem>
                <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil" />&nbsp;<Message msgId="widgets.widget.menu.edit" /></MenuItem>
                <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash" />&nbsp;<Message msgId="widgets.widget.menu.delete" /></MenuItem>
                <MenuItem onClick={() => exportCSV({ title })} eventKey="4"><Glyphicon className="exportCSV" glyph="download" />&nbsp;<Message msgId="widgets.widget.menu.downloadData" /></MenuItem>
            </DropdownButton>
        </ButtonToolbar>}>
        <FeatureGrid
            pageEvents={pageEvents}
            virtualScroll={virtualScroll}
            features={features}
            pages={pages}
            size={size}
            rowKey="id"
            describeFeatureType={describeFeatureType}
            pagination={pagination} />
    </WidgetContainer>

    );
