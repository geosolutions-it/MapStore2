/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

import MapCatalogComp from '../../maps/MapCatalog';
import mapCatalogWithEmptyMap from '../../maps/enhancers/mapCatalogWithEmptyMap';
import handleSelectEnhancer from '../../widgets/builder/wizard/map/enhancers/handleSelect';
import Filter from '../../misc/Filter';
import withLocal from "../../misc/enhancers/localizedProps";
import SideGrid from '../../misc/cardgrids/SideGrid';
import { SourceTypes } from '../../../utils/GeoStoryUtils';

const Icon = require('../../misc/FitIcon');

const FilterLocalized = withLocal('filterPlaceholder')(Filter);
const MapCatalog = mapCatalogWithEmptyMap(MapCatalogComp);
const defaultPreview = <Icon glyph="geoserver" padding={20} />;


const MapList = handleSelectEnhancer(({
    title,
    selectedSource = {},
    setSelected,
    onMapChoice,
    resources,
    selectedItem,
    selected = {},
    selectItem = () => {}
}) => {
    if (selectedSource.type === SourceTypes.GEOSTORY) {
        return (<div>
            <FilterLocalized
            filterPlaceholder="Filtra per titolo"
            onFilter={() => {
                // filterText=""
            }}/>
            <SideGrid
                items={resources.map(({ id, data = {}}) => ({
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
            title={title}
            selected={selected}
            selectedSource={selectedSource}
            onSelected={r => {
                setSelected(r);
                onMapChoice(r); // LAUNCH TWO ACTIONS
                // SELECT ITEM
                // {}
            } } // TODO update preview
        />);
    }
    return null;
});


export default MapList;
