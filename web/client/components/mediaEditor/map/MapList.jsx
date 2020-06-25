/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import {compose, withProps, withHandlers, mapPropsStream} from 'recompose';

import MapCatalogComp from '../../maps/MapCatalog';
import HTML from '../../I18N/HTML';
import mapCatalog from '../../maps/enhancers/mapCatalog';
import handleMapSelect from '../../widgets/builder/wizard/map/enhancers/handleMapSelect';
import Filter from '../../misc/Filter';
import withLocal from "../../misc/enhancers/localizedProps";
import SideGrid from '../../misc/cardgrids/SideGrid';
import { filterResources } from '../../../utils/GeoStoryUtils';
import { SourceTypes } from '../../../utils/MediaEditorUtils';
import withFilter from '../enhancers/withFilter';
import  withSelectedMapReload from '../enhancers/withSelectedMapReload';

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
                                    id: i.map.id,
                                    type: "map",
                                    ...i.map,
                                    // this decode is for backward compatibility with old linked resources`rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` not needed for new ones `rest/geostore/data/2/raw?decode=datauri`
                                    thumbnail: decodeURIComponent(i.map.thumbnail || "")
                                }))
                            }
                        });
                    }
                })
                .ignoreElements() // don't want to emit props
        )))(MapCatalogComp);
const defaultPreview = <Icon glyph="geoserver" padding={20} />;


const MapList = ({
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
        const maps = filterResources(resources, filterText);

        return (<div className="ms-mapList">
            <FilterLocalized
                filterPlaceholder="mediaEditor.mediaPicker.mapFilter"
                filterText={filterText}
                onFilter={onFilter}
            />
            {maps.length > 0 && (
                <SideGrid
                    items={maps.map(({ id, data}) => ({
                        preview: data.thumbnail ? <img src={data.thumbnail}/> : defaultPreview,
                        title: data.name || data.title,
                        onClick: () => selectItem(id),
                        selected: selectedItem && selectedItem.id && id === selectedItem.id,
                        description: data.description
                    }))}
                />) || (
                <div className="msEmptyListMessage">
                    <HTML msgId="mediaEditor.mapList.emptyList"/>
                </div>)
            }
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
};


export default compose(
    withFilter,
    withHandlers({
        onMapSelected: ({onMapSelected = () => {}} = {}) => ({map}) => {
            onMapSelected(map);
        }
    }),
    withProps(() => ({
        includeMapId: true
    })),
    handleMapSelect,
    withSelectedMapReload
)(MapList);
