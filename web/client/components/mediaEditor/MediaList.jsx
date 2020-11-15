/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from "react";
import { isNil } from 'lodash';
import { compose } from 'recompose';

import { MediaTypes } from '../../utils/GeoStoryUtils';
import { SourceTypes } from '../../utils/MediaEditorUtils';
import Toolbar from '../misc/toolbar/Toolbar';
import withMapEditing from './enhancers/withMapEditing';
import withRemoveResource from './enhancers/withRemoveResource';
import withLocal from "../misc/enhancers/localizedProps";
import Filter from '../misc/Filter';
import Loader from '../misc/Loader';
import SideGrid from '../misc/cardgrids/SideGrid';
import HTML from '../I18N/HTML';
import withDebounceOnCallback from '../misc/enhancers/withDebounceOnCallback';
import withScrollSpy from '../misc/enhancers/infiniteScroll/withScrollSpy';
import Icon from '../misc/FitIcon';
import Message from "../I18N/Message";

const SideList = withScrollSpy()(SideGrid);

const FilterLocalized = withLocal('filterPlaceholder')(
    withDebounceOnCallback('onFilter', 'filterText')(Filter)
);

const mediaOptions = {
    [MediaTypes.IMAGE]: {
        glyph: 'image',
        emptyMessageId: 'mediaEditor.imageList.emptyList',
        filterPlaceholderMessageId: 'mediaEditor.mediaPicker.imageFilter'
    },
    [MediaTypes.VIDEO]: {
        glyph: 'play',
        emptyMessageId: 'mediaEditor.videoList.emptyList',
        filterPlaceholderMessageId: 'mediaEditor.mediaPicker.videoFilter'
    },
    [MediaTypes.MAP]: {
        glyph: '1-map',
        emptyMessageId: 'mediaEditor.mapList.emptyList',
        filterPlaceholderMessageId: 'mediaEditor.mediaPicker.mapFilter'
    }
};

export default compose(
    withMapEditing,
    withRemoveResource
)(({
    resources = [],
    services = [],
    selectedItem,
    selectedSource = {},
    selectedService,
    mediaType,
    selectItem = () => { },
    setAddingMedia = () => { },
    setEditingMedia = () => { },
    editRemoteMap = () => { },
    removeMedia = () => { },
    params,
    totalCount,
    onLoad,
    loadingSelected,
    loading,
    buttons = [
        {
            glyph: 'plus',
            tooltipId: 'mediaEditor.mediaPicker.add',
            visible: !!selectedSource?.addMediaEnabled?.[mediaType],
            onClick: () => setAddingMedia(true)
        },
        {
            glyph: 'pencil',
            tooltipId: 'mediaEditor.mediaPicker.edit',
            visible: !!(
                // undefined is an internal resource (geostory)
                // or imported by an external service an saved in the configuration (geostore)
                (selectedItem?.data?.sourceId === undefined
                    // we should edit with the specific source service
                    // and exclude this options in the other lists
                    // if the source id is defined in the data of the selected item (geonode)
                    || selectedItem?.data?.sourceId === selectedService)
                && selectedSource?.editMediaEnabled?.[mediaType]
                && !isNil(selectedItem)
            ),
            onClick: () => {
                if (selectedSource.type === SourceTypes.GEOSTORY) {
                    setEditingMedia(true);
                } else if (selectedSource.type === SourceTypes.GEOSTORE) {
                    editRemoteMap();
                }
            }
        },
        {
            glyph: 'trash',
            tooltipId: 'mediaEditor.mediaPicker.trash',
            visible: !!(selectedSource?.removeMediaEnabled?.[mediaType] && !isNil(selectedItem)
            ),
            onClick: removeMedia
        }
    ]
}) => {
    const filterText = params?.q || '';
    function handleLoadResources(newParams) {
        onLoad(
            { ...params, ...newParams },
            mediaType,
            selectedService
        );
    }
    const {
        glyph,
        emptyMessageId,
        filterPlaceholderMessageId
    } = mediaOptions[mediaType] || {};
    const initialLoading = resources.length === 0 && loading;
    return (
        <div style={{ position: 'relative' }} className="ms-media-list">
            {
                // when no buttons visible, do not render toolbar components
                buttons.filter(b => !isNil(b.visible) ? b.visible : true).length > 0 &&
                <div
                    className="ms-media-toolbar"
                    key="toolbar">
                    <Toolbar
                        btnDefaultProps={{
                            bsStyle: 'primary',
                            className: 'square-button-md'
                        }}
                        buttons={buttons} />
                </div>
            }
            <FilterLocalized
                filterPlaceholder={filterPlaceholderMessageId}
                filterText={filterText}
                onFilter={(newFilterText) => {
                    handleLoadResources({ page: 1, q: newFilterText });
                }}
            />
            {resources.length > 0
                ? (
                    <SideList
                        loading={loading}
                        scrollOptions={{
                            pageSize: params.pageSize
                        }}
                        items={resources.map(({ id, data = {} }) => {
                            const service = services?.find(({ id: serviceId }) => serviceId === data.sourceId);
                            return {
                                preview: (data.thumbnail || mediaType === MediaTypes.IMAGE && data.src)
                                    ? <div
                                        style={{
                                            backgroundImage: `url("${data.thumbnail || data.src}")`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            height: '100%',
                                            overflow: 'hidden'
                                        }} />
                                    : <Icon
                                        glyph={glyph}
                                        padding={20}
                                    />,
                                title: data.title || data.name,
                                onClick: () => selectItem(id),
                                selected: selectedItem && selectedItem.id && id === selectedItem.id,
                                description: data.description,
                                caption: service && <Message msgId={service.name} />
                            };
                        })}
                        hasMore={() => totalCount > resources.length}
                        onLoadMore={(newPage) => {
                            handleLoadResources({ page: newPage + 1 });
                        }}
                    />
                )
                : !initialLoading &&
                <div className="msEmptyListMessage">
                    <HTML msgId={emptyMessageId} />
                </div>}
            <div className="ms-media-list-pagination">
                <div>
                    {(resources.length && totalCount)
                        ? <HTML msgId="mediaEditor.mediaList.resultsCount" msgParams={{ count: resources.length, total: totalCount }} />
                        : null}
                </div>
                {loading && <Loader size={20} />}
            </div>
            {(loadingSelected || initialLoading) &&
                <div className="ms-media-list-loading">
                    <Loader size={70} />
                </div>}
        </div>);
});
