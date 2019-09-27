/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import {compose, mapPropsStream} from 'recompose';

import MapCatalogComp from '../../maps/MapCatalog';
import mapCatalog from '../../maps/enhancers/mapCatalog';
import handleSelectEnhancer from '../../widgets/builder/wizard/map/enhancers/handleSelect';
import Filter from '../../misc/Filter';
import withLocal from "../../misc/enhancers/localizedProps";
import SideGrid from '../../misc/cardgrids/SideGrid';
import { SourceTypes, filterResources } from '../../../utils/GeoStoryUtils';
import withFilter from '../../misc/enhancers/withFilter';

const Icon = require('../../misc/FitIcon');

const FilterLocalized = withLocal('filterPlaceholder')(Filter);

const MapCatalog = compose(
    mapCatalog,
    /* the next stream updates the media Editor state, of maps in this case,
     * every time the items change
    */
    mapPropsStream( props$ =>
        props$.merge(
            props$
                .distinctUntilKeyChanged('items')
                .do(({items = [], loadItems, selectedService, mediaType} = {}) => {
                    if (items.length) {
                        loadItems({
                            mediaType,
                            sourceId: selectedService,
                            params: {mediaType},
                            resultData: {
                                resources: items.map(i => ({
                                    ...i.map,
                                    thumbnail: decodeURIComponent(i.map.thumbnail || "")
                                }))
                            }
                        });
                    }
                })
                .ignoreElements() // don't want to emit props
    )))(MapCatalogComp);
const defaultPreview = <Icon glyph="geoserver" padding={20} />;


const MapList = handleSelectEnhancer(
    withFilter(({
        filterText,
        onMapChoice,
        resources,
        selectedSource = {},
        setSelected,
        selectedItem,
        selectedService,
        items,
        mediaType,
        selected = {},
        loadItems = () => {},
        onFilter = () => {},
        selectItem = () => {}
}) => {
    if (selectedSource.type === SourceTypes.GEOSTORY) {
        return (<div className="ms-mapList">
            <FilterLocalized
                filterPlaceholder="mediaEditor.mediaPicker.mapFilter"
                filterText={filterText}
                onFilter={onFilter}
            />
            <SideGrid
                items={filterResources(resources, filterText).map(({ id, data = {}}) => ({
                    preview: data.thumbnail ? <img src={data.thumbnail}/> : defaultPreview,
                    title: data.name || data.title,
                    onClick: () => selectItem(id),
                    selected: selectedItem && selectedItem.id && id === selectedItem.id,
                    description: data.description
                }))}
            />
        </div>);
    }
    if (selectedSource.type === SourceTypes.GEOSTORE) {
        return (<MapCatalog
            title={null}
            selected={selected}
            mediaType={mediaType}
            loadItems={loadItems}
            items={items}
            selectedService={selectedService}
            selectedSource={selectedSource}
            onSelected={r => {
                setSelected(r);
                selectItem(r.id);
                onMapChoice(r);
            }}
        />);
    }
    return null;
}));


export default MapList;
