/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

import withFilter from '../enhancers/withFilter';
import withLocal from "../../misc/enhancers/localizedProps";
import Filter from '../../misc/Filter';
import HTML from '../../I18N/HTML';
import SideGrid from '../../misc/cardgrids/SideGrid';
import { filterResources } from '../../../utils/GeoStoryUtils';
const Icon = require('../../misc/FitIcon');

const FilterLocalized = withLocal('filterPlaceholder')(Filter);

export default withFilter(({
    filterText,
    resources = [],
    selectedItem,
    onFilter = () => {},
    selectItem = () => {}
}) => (
    <div className="ms-video-list">
        <FilterLocalized
            className="ms-video-filter"
            filterPlaceholder="mediaEditor.mediaPicker.videoFilter"
            filterText={filterText}
            onFilter={onFilter}/>
        {resources.length > 0
            ? <SideGrid
                items={filterResources(resources, filterText).map(({ id, data = {}}) => ({
                    preview: data.thumbnail
                        ? <div
                            style={{
                                background: `url("${data.thumbnail}")`,
                                backgroundSize: 'cover',
                                height: "100%",
                                overflow: 'hidden'
                            }} />
                        : <Icon
                            glyph="play"
                            padding={20}
                        />,
                    title: data.title,
                    onClick: () => selectItem(id),
                    selected: selectedItem && selectedItem.id && id === selectedItem.id,
                    description: data.description
                }))} />
            : <div className="msEmptyListMessage">
                <HTML msgId="mediaEditor.videoList.emptyList"/>
            </div>}
    </div>));
