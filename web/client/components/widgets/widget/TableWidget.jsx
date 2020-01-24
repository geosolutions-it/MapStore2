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
const {getWidgetFilterRenderers} = require('../../../plugins/widgets/getWidgetFilterRenderers');

const FeatureGrid = errorChartState(loadingState(({ describeFeatureType }) => !describeFeatureType)(require('../../data/featuregrid/FeatureGrid')));

const WidgetContainer = require('./WidgetContainer');

module.exports = getWidgetFilterRenderers(({
    id,
    title,
    loading,
    confirmDelete = false,
    enableColumnFilters = false,
    headerStyle,
    icons,
    topRightItems,
    toggleDeleteConfirm = () => { },
    onDelete = () => { },
    gridEvents = () => {},
    pageEvents = {
        moreFeatures: () => {}
    },
    describeFeatureType,
    filterRenderers,
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
        icons={icons}
        confirmDelete={confirmDelete}
        onDelete={onDelete}
        toggleDeleteConfirm={toggleDeleteConfirm}
        topRightItems={topRightItems}>
        <BorderLayout
            footer={pagination.totalFeatures ? (
                <div style={{ height: "30px", overflow: "hidden"}}>
                    {loading ? <span style={{ "float": "right"}}><LoadingSpinner /></span> : null}
                    {error === undefined &&
                    <span style={{ "float": "left", margin: "5px" }} ><Message
                        msgId={"featuregrid.resultInfoVirtual"}
                        msgParams={{ total: pagination.totalFeatures }} /></span>}
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
                enableColumnFilters={enableColumnFilters}
                filterRenderers={filterRenderers}
                features={features}
                pages={pages}
                error={error}
                size={size}
                rowKey="id"
                describeFeatureType={describeFeatureType}
                pagination={pagination} />
        </BorderLayout>
    </WidgetContainer>

    ));
