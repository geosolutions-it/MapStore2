/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../I18N/Message');
const BorderLayout = require('../../layout/BorderLayout');
const LoadingSpinner = require('../../misc/LoadingSpinner');
const EmptyRowsView = require('../../data/featuregrid/EmptyRowsView');
const loadingState = require('../../misc/enhancers/loadingState');
const errorChartState = require('../enhancers/errorChartState');

const FeatureGrid = errorChartState(loadingState(({ describeFeatureType }) => !describeFeatureType)(require('../../data/featuregrid/FeatureGrid')));
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
    headerStyle,
    canEdit = true,
    toggleTableView = () => { },
    toggleDeleteConfirm = () => { },
    onEdit = () => { },
    onDelete = () => { },
    gridEvents = () => {},
    pageEvents = {
        moreFeatures: () => {}
    },
    describeFeatureType,
    columnSettings,
    features,
    size,
    pages,
    error,
    pagination = {},
    virtualScroll = true
}) =>
    (<WidgetContainer
        id={`widget-chart-${id}`}
        title={title}
        headerStyle={headerStyle}
        topLeftItems={renderHeaderLeftTopItem({ loading, title, description, toggleTableView })}
        confirmDelete={confirmDelete}
        onDelete={onDelete}
        toggleDeleteConfirm={toggleDeleteConfirm}
        topRightItems={<ButtonToolbar>
            {canEdit ? (<DropdownButton pullRight bsStyle="default" className="widget-menu" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
                <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil" />&nbsp;<Message msgId="widgets.widget.menu.edit" /></MenuItem>
                <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash" />&nbsp;<Message msgId="widgets.widget.menu.delete" /></MenuItem>
            </DropdownButton>) : null}
        </ButtonToolbar>}>
        <BorderLayout
            footer={pagination.totalFeatures ? (
                    <div style={{ height: "30px", overflow: "hidden"}}>
                    {loading ? <span style={{ "float": "right"}}><LoadingSpinner /></span> : null}
                    <span style={{ "float": "left", margin: "5px" }} ><Message
                            msgId={"featuregrid.resultInfoVirtual"}
                            msgParams={{ total: pagination.totalFeatures }} /></span>
                    </div>) : null}
        >
        <FeatureGrid
            emptyRowsView={() => <EmptyRowsView loading={loading} />}
            gridEvents={gridEvents}
            sortable={false}
            defaultSize={false}
            columnSettings={columnSettings}
            pageEvents={pageEvents}
            virtualScroll={virtualScroll}
            features={features}
            pages={pages}
            error={error}
            size={size}
            rowKey="id"
            describeFeatureType={describeFeatureType}
            pagination={pagination} />
        </BorderLayout>
    </WidgetContainer>

    );
