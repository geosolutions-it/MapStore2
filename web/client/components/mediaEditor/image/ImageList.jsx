import {isNil} from 'lodash';
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

import SideGrid from '../../misc/cardgrids/SideGrid';
import Toolbar from '../../misc/toolbar/Toolbar';

export default ({
    resources = [],
    selectedItem,
    selectItem = () => { },
    setAddingMedia = () => {},
    setEditingMedia = () => {}
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
                    marginBottom: 8
                }
            }}
            btnDefaultProps={{
                bsStyle: 'primary',
                className: 'square-button-md'
            }}
            buttons={[
                {
                    glyph: 'plus',
                    tooltipId: 'mediaEditor.mediaPicker.add',
                    onClick: () => setAddingMedia(true)
                },
                {
                    glyph: 'pencil',
                    tooltipId: 'mediaEditor.mediaPicker.edit',
                    visible: !isNil(selectedItem),
                    onClick: () => setEditingMedia(true)
                }
            ]} />
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
