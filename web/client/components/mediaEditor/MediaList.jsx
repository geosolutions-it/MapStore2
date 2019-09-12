/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import {isNil} from 'lodash';

import Toolbar from '../misc/toolbar/Toolbar';
import SideGrid from '../misc/cardgrids/SideGrid';
import withLocal from "../misc/enhancers/localizedProps";

import Filter from '../misc/Filter';
const FilterLocalized = withLocal('filterPlaceholder')(Filter);

export default ({
    resources = [],
    selectedItem,
    setMediaService = () => { },
    selectItem = () => { },
    setAddingMedia = () => {},
    setEditingMedia = () => {},
    buttons = [
        {
            glyph: 'plus',
            tooltipId: 'mediaEditor.imagePicker.add',
            onClick: () => setAddingMedia(true)
        },
        {
            glyph: 'pencil',
            tooltipId: 'mediaEditor.imagePicker.edit',
            visible: !isNil(selectedItem),
            onClick: () => setEditingMedia(true)
        }
    ]
}) => (
<div style={{position: 'relative'}} className="ms-imageList">
    <div
        className="text-center"
        key="toolbar"
        style={{
            borderBottom: '1px solid #ddd',
            padding: 8
        }}>
        <Toolbar
            btnGroupProps={{
                style: {
                    paddingTop: "16px",
                    marginBottom: 8
                }
            }}
            btnDefaultProps={{
                bsStyle: 'primary',
                className: 'square-button-md'
            }}
            buttons={buttons} />
        <FilterLocalized
            filterPlaceholder="Filtra per titolo"

            onFilter={() => {
                // filterText=""
            }}/>
    </div>
    <SideGrid
        items={resources.map(({ id, data = {}}) => ({
            preview: <div
                style={{
                    background: `url("${data.src}")`,
                    backgroundSize: 'cover',
                    height: "100%",
                    overflow: 'hidden'
                }} />,
            title: data.title,
            onClick: () => selectItem(id),
            selected: selectedItem && selectedItem.id && id === selectedItem.id,
            description: data.description
        }))} />
</div>);
