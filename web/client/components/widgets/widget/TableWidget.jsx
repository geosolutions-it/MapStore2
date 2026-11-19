/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { lazy, useMemo } from 'react';

import { getWidgetFilterRenderers } from '../../../plugins/widgets/getWidgetFilterRenderers';
import { describeFeatureTypeToSchema } from '../../../utils/FeatureTypeUtils';
import EmptyRowsView from '../../data/featuregrid/EmptyRowsView';
import Message from '../../I18N/Message';
import BorderLayout from '../../layout/BorderLayout';
import loadingState from '../../misc/enhancers/loadingState';
import LoadingSpinner from '../../misc/LoadingSpinner';
import errorChartState from '../enhancers/errorChartState';
import WidgetContainer from './WidgetContainer';
import WidgetEmptyMessage from './WidgetEmptyMessage';
import withSuspense from '../../misc/withSuspense';

const FeatureGridComp = withSuspense()(lazy(() => import('../../data/featuregrid/FeatureGrid')));
const FeatureGrid = errorChartState(loadingState(({ schema }) => !schema)(FeatureGridComp));
const DEFAULT_GRID_HEIGHT = 28;
const defaultGridOpts = ['rowHeight', 'headerRowHeight', 'headerFiltersHeight']
    .reduce((acc, prop) => ({...acc, [prop]: DEFAULT_GRID_HEIGHT}), '');

const TableWidget = ({
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
    layer,
    size,
    pages,
    error,
    pagination = {},
    dataGrid = {},
    virtualScroll = true,
    gridOpts = defaultGridOpts,
    options = {},
    dateFormats,
    gridTools
}) => {
    const schema = useMemo(
        () => describeFeatureType ? describeFeatureTypeToSchema(describeFeatureType, layer?.fields) : undefined,
        [describeFeatureType, layer?.fields]
    );
    return (<WidgetContainer
        id={`widget-chart-${id}`}
        title={title}
        headerStyle={headerStyle}
        icons={icons}
        isDraggable={dataGrid.isDraggable}
        confirmDelete={confirmDelete}
        onDelete={onDelete}
        toggleDeleteConfirm={toggleDeleteConfirm}
        topRightItems={topRightItems}
        options={options}>
        <BorderLayout
            footer={pagination.totalFeatures ? (
                <div className={"widget-footer"}>
                    {loading ? <span style={{ "float": "right"}}><LoadingSpinner /></span> : null}
                    {error === undefined &&
                    <span className={"result-info"} ><Message
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
                fields={layer?.fields}
                features={features}
                pages={pages}
                error={error}
                size={size}
                rowKey="id"
                schema={schema}
                pagination={pagination}
                gridOpts={gridOpts}
                options={options}
                tools={gridTools}       // if geom prop is existing show zoom icon
                dateFormats={dateFormats}/>
        </BorderLayout>
    </WidgetContainer>);
};

// recompose calls a plain function component directly, so its hooks need an element in between
export default getWidgetFilterRenderers((props) => <TableWidget {...props} />);
