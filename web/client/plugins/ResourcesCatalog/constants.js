/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const DEFAULT_METADATA = {
    table: [
        {
            path: 'name',
            target: 'header',
            width: 20,
            labelId: 'resourcesCatalog.columnName'
        },
        {
            path: 'description',
            width: 20,
            labelId: 'resourcesCatalog.columnDescription'
        },
        {
            path: 'tags',
            filter: 'filter{tag.in}',
            itemValue: 'name',
            itemColor: 'color',
            width: 30,
            type: 'tag',
            noDataLabelId: 'resourcesCatalog.emptyNA',
            labelId: 'resourcesCatalog.columnTags'
        },
        {
            path: 'lastUpdate',
            type: 'date',
            format: 'MMM Do YY, h:mm:ss a',
            width: 20,
            icon: { glyph: 'time' },
            labelId: 'resourcesCatalog.columnLastModified',
            noDataLabelId: 'resourcesCatalog.emptyNA'
        },
        {
            path: 'creator',
            target: 'footer',
            filter: 'filter{creator.in}',
            icon: { glyph: 'user' },
            width: 10,
            labelId: 'resourcesCatalog.columnCreatedBy',
            noDataLabelId: 'resourcesCatalog.emptyUnknown',
            disableIf: '{!state("userrole")}'
        }
    ],
    grid: [
        {
            path: 'name',
            target: 'header'
        },
        {
            path: 'tags',
            filter: 'filter{tag.in}',
            itemValue: 'name',
            itemColor: 'color',
            type: 'tag',
            showFullContent: true
        },
        {
            path: 'creator',
            target: 'footer',
            filter: 'filter{creator.in}',
            icon: { glyph: 'user' },
            noDataLabelId: 'resourcesCatalog.emptyUnknown',
            disableIf: '{!state("userrole")}',
            tooltipId: 'resourcesCatalog.columnCreatedBy'
        }
    ]
};

export const CARD_LAYOUT_TYPES = {
    GRID: 'grid',
    LIST: 'list',
    TABLE: 'table'
};

export const DEFAULT_CARD_LAYOUT_STYLE = CARD_LAYOUT_TYPES.GRID;

export const DEFAULT_CARD_LAYOUT_STYLES = [CARD_LAYOUT_TYPES.GRID, CARD_LAYOUT_TYPES.TABLE];

export const DEFAULT_HIDE_THUMBNAIL = {
    [CARD_LAYOUT_TYPES.GRID]: false,
    [CARD_LAYOUT_TYPES.LIST]: true
};

export const DEFAULT_CARD_LAYOUT_SIZES = {
    [CARD_LAYOUT_TYPES.TABLE]: 'sm',
    [CARD_LAYOUT_TYPES.LIST]: 'md',
    [CARD_LAYOUT_TYPES.GRID]: 'lg'
};

export const DEFAULT_CARD_LAYOUT_GLYPHS = {
    [CARD_LAYOUT_TYPES.GRID]: 'th',
    [CARD_LAYOUT_TYPES.LIST]: 'th-list',
    [CARD_LAYOUT_TYPES.TABLE]: 'table'
};
