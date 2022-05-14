/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { getWidgetFilterRenderers } from '../../../plugins/widgets/getWidgetFilterRenderers';
import EmptyRowsView from '../../data/featuregrid/EmptyRowsView';
import FeatureGridComp from '../../data/featuregrid/FeatureGrid';
import Message from '../../I18N/Message';
import BorderLayout from '../../layout/BorderLayout';
import loadingState from '../../misc/enhancers/loadingState';
import LoadingSpinner from '../../misc/LoadingSpinner';
import errorChartState from '../enhancers/errorChartState';
import WidgetContainer from './WidgetContainer';
import WidgetEmptyMessage from './WidgetEmptyMessage';

const FeatureGrid = errorChartState(loadingState(({ describeFeatureType }) => !describeFeatureType)(FeatureGridComp));


export default getWidgetFilterRenderers(({
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
    dataGrid = {},
    virtualScroll = true
}) =>
    (<WidgetContainer
        id={`widget-chart-${id}`}
        title={title}
        headerStyle={headerStyle}
        icons={icons}
        isDraggable={dataGrid.isDraggable}
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
                emptyRowsView={() => (<EmptyRowsView loading={loading}>
                    <WidgetEmptyMessage messageId="featuregrid.noFeaturesAvailable" glyph="features-grid"/>
                </EmptyRowsView>)}
                gridEvents={gridEvents}
                sortable
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
