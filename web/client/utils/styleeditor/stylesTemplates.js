/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const uuidv1 = require('uuid/v1');
const SVGPreview = require('../../components/styleeditor/SVGPreview');

/**
 * Template object structure
 * @prop {string} title title of style template
 * @prop {array} types types that support current style template, eg: ['point', 'linestring', 'polygon', 'vector', 'raster']
 * @prop {string} format 'css' or 'sld'
 * @prop {string} code style code
 * @prop {node} preview preview node
 * @prop {string} styleId identifier
 */

const baseTemplates = [{
    types: ['point', 'linestring', 'polygon', 'vector'],
    title: 'Base CSS',
    format: 'css',
    code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tstroke: #999999;\n\tmark: symbol(square);\n\t:mark { fill: #ff0000; };\n}",
    preview: <SVGPreview
        backgroundColor="#333333"
        texts={[
            {
                text: 'CSS',
                fill: '#ffaa33',
                style: {
                    fontSize: 64,
                    fontWeight: 'bold'
                }
            }
    ]}/>
},
{
    types: ['point', 'linestring', 'polygon', 'vector'],
    title: 'Base SLD',
    format: 'sld',
    code: '<?xml version="1.0" encoding="ISO-8859-1"?>\n<StyledLayerDescriptor version="1.0.0"\n\t\txsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"\n\t\txmlns="http://www.opengis.net/sld"\n\t\txmlns:ogc="http://www.opengis.net/ogc"\n\t\txmlns:xlink="http://www.w3.org/1999/xlink"\n\t\txmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n\n\t<NamedLayer>\n\t\t<Name>Default Style</Name>\n\t\t<UserStyle>\n\t\t\t<Title>${styleTitle}</Title>\n\t\t\t<Abstract>${styleAbstract}</Abstract>\n\t\t\t<FeatureTypeStyle>\n\t\t\t\t<Rule>\n\t\t\t\t\t<Name>Rule Name</Name>\n\t\t\t\t\t<Title>Rule Title</Title>\n\t\t\t\t\t<Abstract>Rule Abstract</Abstract>\n\t\t\t\t\t<LineSymbolizer>\n\t\t\t\t\t\t<Stroke>\n\t\t\t\t\t\t\t<CssParameter name="stroke">#0000FF</CssParameter>\n\t\t\t\t\t\t</Stroke>\n\t\t\t\t\t\t</LineSymbolizer>\n\t\t\t\t\t<PointSymbolizer>\n\t\t\t\t\t\t<Graphic>\n\t\t\t\t\t\t\t<Mark>\n\t\t\t\t\t\t\t\t<WellKnownName>square</WellKnownName>\n\t\t\t\t\t\t\t\t<Fill>\n\t\t\t\t\t\t\t\t\t<CssParameter name="fill">#FF0000</CssParameter>\n\t\t\t\t\t\t\t\t</Fill>\n\t\t\t\t\t\t\t</Mark>\n\t\t\t\t\t\t</Graphic>\n\t\t\t\t\t</PointSymbolizer>\n\t\t\t\t\t</Rule>\n\t\t\t\t</FeatureTypeStyle>\n\t\t\t</UserStyle>\n\t\t</NamedLayer>\n\t</StyledLayerDescriptor>\n',
    preview: <SVGPreview
        backgroundColor="#333333"
        texts={[
            {
                text: 'SLD',
                fill: '#33ffaa',
                style: {
                    fontSize: 64,
                    fontWeight: 'bold'
                }
            }
    ]}/>
},
{
    types: ['raster'],
    title: 'Base CSS',
    format: 'css',
    code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\traster-channels: auto;\n}",
    preview: <SVGPreview
        backgroundColor="#333333"
        texts={[
            {
                text: 'CSS',
                fill: '#ffaa33',
                style: {
                    fontSize: 64,
                    fontWeight: 'bold'
                }
            }
    ]}/>
},
{
    types: ['raster'],
    title: 'Base SLD',
    format: 'sld',
    code: '<?xml version="1.0" encoding="ISO-8859-1"?>\n<StyledLayerDescriptor version="1.0.0"\n\t\txsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"\n\t\txmlns="http://www.opengis.net/sld"\n\t\txmlns:ogc="http://www.opengis.net/ogc"\n\t\txmlns:xlink="http://www.w3.org/1999/xlink"\n\t\txmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n\n\t<NamedLayer>\n\t\t<Name>Default Style</Name>\n\t\t<UserStyle>\n\t\t\t<Title>${styleTitle}</Title>\n\t\t\t<Abstract>${styleAbstract}</Abstract>\n\t\t\t<FeatureTypeStyle>\n\t\t\t\t<Rule>\n\t\t\t\t\t<Name>Rule Name</Name>\n\t\t\t\t\t<Title>Rule Title</Title>\n\t\t\t\t\t<Abstract>Rule Abstract</Abstract>\n\t\t\t\t\t<RasterSymbolizer>\n\t\t\t\t\t\t<Opacity>1.0</Opacity>\n\t\t\t\t\t\t</RasterSymbolizer>\n\t\t\t\t\t</Rule>\n\t\t\t\t</FeatureTypeStyle>\n\t\t\t</UserStyle>\n\t\t</NamedLayer>\n\t</StyledLayerDescriptor>\n',
    preview: <SVGPreview
        backgroundColor="#333333"
        texts={[
            {
                text: 'SLD',
                fill: '#33ffaa',
                style: {
                    fontSize: 64,
                    fontWeight: 'bold'
                }
            }
    ]}/>
}].map(style => ({ ...style, styleId: uuidv1() }));

const customTemplates = [
    {
        types: ['linestring', 'vector'],
        title: 'Line',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #999999;\n}",
        preview: <SVGPreview
            type="linestring"
            paths={[
                {
                    stroke: '#999999',
                    strokeWidth: 2
                }
            ]}/>
    },
    {
        types: ['linestring', 'vector'],
        title: 'Dashed line',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #333333;\n\tstroke-width: 0.75;\n\tstroke-dasharray: 6 2;\n}",
        preview: <SVGPreview
            type="linestring"
            paths={[
                {
                    stroke: '#333333',
                    strokeWidth: 4,
                    strokeDasharray: '20 4'
                }
            ]}/>
    },
    {
        types: ['linestring', 'vector'],
        title: 'Section line',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #330033;\n\tstroke-width: 1;\n\tstroke-dasharray: 10 4 1 4;\n}",
        preview: <SVGPreview
            type="linestring"
            paths={[
                {
                    stroke: '#330033',
                    strokeWidth: 4,
                    strokeDasharray: '20 10 4 10'
                }
            ]}/>
    },
    {
        types: ['linestring', 'vector'],
        title: 'Simple railway',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #333333, #333333;\n\tstroke-width: 0.5, 7;\n\tstroke-dasharray: 1 0, 1 10;\n}",
        preview: <SVGPreview
            type="linestring"
            paths={[
                {
                    stroke: '#333333',
                    strokeWidth: 2,
                    strokeLinejoin: 'round'
                },
                {
                    stroke: '#333333',
                    strokeWidth: 16,
                    strokeDasharray: '2 20',
                    strokeLinejoin: 'round'
                }
            ]}/>
    },
    {
        types: ['linestring', 'vector'],
        title: 'Railway',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #777777, #ffffff;\n\tstroke-width: 4, 2;\n\tstroke-dasharray: 1 0, 10 10;\n\tz-index: 0, 1;\n}",
        preview: <SVGPreview
            type="linestring"
            paths={[
                {
                    stroke: '#777777',
                    strokeWidth: 8,
                    strokeLinejoin: 'round'
                },
                {
                    stroke: '#ffffff',
                    strokeWidth: 6,
                    strokeDasharray: '20 20',
                    strokeLinejoin: 'round'
                }
            ]}/>
    },
    {
        types: ['linestring', 'vector'],
        title: 'Waterway',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #8bbceb, #bbddff;\n\tstroke-width: 10, 8;\n\tstroke-linejoin: round;\n\tz-index: 0, 1;\n}",
        preview: <SVGPreview
            type="linestring"
            paths={[
                {
                    stroke: '#8bbceb',
                    strokeWidth: 14,
                    strokeLinejoin: 'round'
                },
                {
                    stroke: '#bbddff',
                    strokeWidth: 12,
                    strokeLinejoin: 'round'
                }
            ]}/>
    },
    {
        types: ['linestring', 'vector'],
        description: 'A simple style for polygon',
        caption: 'polygon',
        title: 'Red road',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #ff5539, #ffffff;\n\tstroke-width: 8, 5;\n\tz-index: 0, 1;\n}",
        preview: <SVGPreview
            type="linestring"
            paths={[
                {
                    stroke: '#ff5539',
                    strokeWidth: 14
                },
                {
                    stroke: '#ffffff',
                    strokeWidth: 7
                }
            ]}/>
    },
    {
        types: ['polygon', 'vector'],
        description: 'A simple style for polygon',
        caption: 'polygon',
        title: 'Solid fill',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tfill: #aaaaaa;\n}",
        preview: <SVGPreview type="polygon" paths={[{ fill: "#aaaaaa"}]} />
    },
    {
        types: ['polygon', 'vector'],
        description: 'Base Style',
        caption: 'polygon',
        title: 'Forest fill',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tfill: #c1ffb3, symbol(triangle);\n\t:fill {\n\t\tfill: #98c390;\n\t\tstroke: #e9ffde;\n\t\tsize: 15;\n\t};\n}",
        preview: <SVGPreview
            type="polygon"
            paths={[{ fill: "#c1ffb3"}, {fill: "url(#tree)"}]}
            patterns={[{
                id: 'tree', icon: { d: 'M0.1 0.9 L0.5 0.1 L0.9 0.9Z', fill: '#98c390'}
            }]} />
    }
].map(style => ({ ...style, styleId: uuidv1() }));

module.exports = {
    baseTemplates,
    customTemplates
};
