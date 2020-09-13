/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const { Glyphicon: GlyphiconRB } = require('react-bootstrap');
const BorderLayout = require('../layout/BorderLayout');
const emptyState = require('../misc/enhancers/emptyState');
const withLocal = require("../misc/enhancers/localizedProps");
const Filter = withLocal('filterPlaceholder')(require('../misc/Filter'));
const SVGPreview = require('./SVGPreview');
const Message = require('../I18N/Message');
const tooltip = require('../misc/enhancers/tooltip');
const Glyphicon = tooltip(GlyphiconRB);

const SideGrid = emptyState(
    ({items}) => items.length === 0,
    {
        title: <Message msgId="styleeditor.filterMatchNotFound"/>,
        glyph: '1-stilo'
    }
)(require('../misc/cardgrids/SideGrid'));

// get the text to use in the icon
const getFormatText = (format) => {
    const text = {
        sld: 'SLD',
        css: 'CSS',
        mbstyle: 'MBS'
    };
    return text[format] || format || '';
};

/**
 * Component for rendering a grid of style templates.
 * @memberof components.styleeditor
 * @name StyleList
 * @class
 * @prop {bool} showDefaultStyleIcon show icon near default style
 * @prop {string} enabledStyle name of style in use
 * @prop {string} defaultStyle name of default style
 * @prop {array} availableStyles array of all available styles, eg: [{TYPE_NAME: "WMS_1_3_0.Style", filename: "style.sld", format: "sld", languageVersion: {version: "1.0.0"}, legendURL: [{…}], name: "point", title: "Title", _abstract: ""}]
 * @prop {function} onSelect triggered by clicking on cards, arg. {style}
 * @prop {string} formatColors object of colors, key should be the format name and value an hexadecimal color, it changes color of text in preview
 * @prop {string} filterText
 * @prop {function} onFilter arg. text value from input filter
 */

const StyleList = ({
    showDefaultStyleIcon,
    enabledStyle,
    defaultStyle,
    availableStyles = [],
    onSelect,
    formatColors = {
        sld: '#33ffaa',
        css: '#ffaa33'
    },
    filterText,
    onFilter = () => {}
}) => (
    <BorderLayout
        className="ms-style-editor-list"
        header={
            <Filter
                filterPlaceholder="styleeditor.styleListfilterPlaceholder"
                filterText={filterText}
                onFilter={onFilter}/>
        }>
        <SideGrid
            size="sm"
            onItemClick={({ name }) => onSelect({ style: defaultStyle === name ? '' : name }, true)}
            items={availableStyles
                .filter(({name = '', title = '', _abstract = '', metadata = {} }) => !filterText
                    || filterText && (
                        name.indexOf(filterText) !== -1
                        || metadata?.title?.indexOf(filterText) !== -1
                        || metadata?.description?.indexOf(filterText) !== -1
                        || title.indexOf(filterText) !== -1
                        || _abstract.indexOf(filterText) !== -1
                    ))
                .map(style => ({
                    ...style,
                    title: style?.metadata?.title || style.label || style.title || style.name,
                    description: style?.metadata?.description || style._abstract,
                    selected: enabledStyle === style.name,
                    preview: style.format &&
                            <SVGPreview
                                backgroundColor="#333333"
                                texts={[
                                    {
                                        text: getFormatText(style.format).toUpperCase(),
                                        fill: formatColors[style.format] || '#f2f2f2',
                                        style: {
                                            fontSize: 70,
                                            fontWeight: 'bold'
                                        }
                                    }]}/> || <Glyphicon glyph="geoserver" />,
                    tools: showDefaultStyleIcon && defaultStyle === style.name ? <Glyphicon glyph="star" tooltipId="styleeditor.defaultStyle"/> : null
                }))} />
    </BorderLayout>
);

module.exports = StyleList;
