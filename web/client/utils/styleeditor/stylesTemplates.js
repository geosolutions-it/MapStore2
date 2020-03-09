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
const randomDots = require('./img/randomdots.png');

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
        format: 'css',
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
        format: 'css',
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
        format: 'css',
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
        format: 'css',
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
        format: 'css',
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
        format: 'css',
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
        title: 'Red road',
        format: 'css',
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
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    stroke: symbol('circle');
    stroke-dasharray: 8 20;
    :stroke {
        size: 8;
        fill: #ddd;
        stroke: #777;
        stroke-width: 0.5;
    };
}
`,
        types: ['linestring', 'vector'],
        title: 'Stroke Pattern',
        format: 'css',
        preview: <SVGPreview
            type="linestring"
            paths={[{
                type: 'point',
                transform: 'translate(-0, -55)',
                d: 'M 100, 100 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }, {
                type: 'point',
                transform: 'translate(-65, 55)',
                d: 'M 100, 100 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }, {
                type: 'point',
                transform: 'translate(-33, 0)',
                d: 'M 100, 100 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }, {
                type: 'point',
                transform: 'translate(33, 0)',
                d: 'M 100, 100 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }, {
                type: 'point',
                transform: 'translate(65, 55)',
                d: 'M 100, 100 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }]}/>
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    stroke: #000, #f2f2f2, symbol(square);
    stroke-width: 4, 2;
    stroke-dasharray: none, none, 8 20;
    :stroke {
        size: 8;
        fill: #ddd;
        stroke: #333;
        stroke-width: 0.5;
    };
}
`,
        types: ['linestring', 'vector'],
        title: 'Fence',
        format: 'css',
        preview: <SVGPreview
            type="linestring"
            paths={[{
                stroke: "#000",
                strokeWidth: 12
            }, {
                stroke: "#f2f2f2",
                strokeWidth: 8
            },
            {
                type: 'point',
                transform: 'translate(100, 40)',
                d: 'M-15 -15 L15 -15 L15 15 L-15 15Z',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }, {
                type: 'point',
                transform: 'translate(35, 150) rotate(-60)',
                d: 'M-15 -15 L15 -15 L15 15 L-15 15Z',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }, {
                type: 'point',
                transform: 'translate(165, 150) rotate(60)',
                d: 'M-15 -15 L15 -15 L15 15 L-15 15ZZ',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }, {
                type: 'point',
                transform: 'translate(67.5, 92.5) rotate(-60)',
                d: 'M-15 -15 L15 -15 L15 15 L-15 15Z',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }, {
                type: 'point',
                transform: 'translate(132.5, 92.5) rotate(60)',
                d: 'M-15 -15 L15 -15 L15 15 L-15 15Z',
                stroke: '#777',
                strokeWidth: 2,
                fill: '#ddd'
            }]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    stroke: #33aaff, symbol('extshape://triangle');
    /*stroke: #33aaff, symbol('extshape://emicircle');*/
    /*stroke: #33aaff, symbol('extshape://triangleemicircle');*/
    stroke-width: 1;
    stroke-dasharray: none, 20 20;
    :stroke {
        size: 20;
        fill: #33aaff;
        stroke: #3a8bbe;
        stroke-width: 0.5;
    };
 }
`,
        types: ['linestring', 'vector'],
        title: 'Weather Symbol',
        format: 'css',
        preview: <SVGPreview
            type="linestring"
            paths={[{
                stroke: "#33aaff",
                strokeWidth: 4
            },
            {
                type: 'point',
                transform: 'translate(67.5, 92.5) rotate(-60)',
                d: 'M-15 0 L15 0 L0 -15Z',
                stroke: '#3a8bbe',
                strokeWidth: 2,
                fill: '#33aaff'
            }, {
                type: 'point',
                transform: 'translate(132.5, 92.5) rotate(60)',
                d: 'M-15 0 L15 0 L0 -15Z',
                stroke: '#3a8bbe',
                strokeWidth: 2,
                fill: '#33aaff'
            }]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    stroke: #333;
    /*
    replace "Label" with [myPropertyName]
    to get a label from feature data
    */
    label: "Label";
    label-anchor: 0.5 0.5;
    /* label-group: true; */
    label-conflict-resolution: false;

    font-fill: #000;
    font-family: "sans-serif";
    /* font-weight: bold; */
    /* font-style: italic; */
    font-size: 20;

    halo-color: #fff;
    halo-radius: 4;
}
`,
        types: ['linestring', 'vector'],
        title: 'Label',
        format: 'css',
        preview: <SVGPreview
            type="linestring"
            paths={[{
                stroke: "#333",
                strokeWidth: 4
            }]}
            texts={[
                {
                    text: 'Label',
                    transform: 'translate(-40, 0)',
                    style: {
                        fontSize: 30,
                        fontWeight: 'bold',
                        strokeWidth: 12,
                        stroke: '#ffffff'
                    }
                },
                {
                    text: 'Label',
                    fill: '#000000',
                    transform: 'translate(-40, 0)',
                    style: {
                        fontSize: 30,
                        fontWeight: 'bold',
                        strokeWidth: 1,
                        stroke: '#000000'
                    }
                }
            ]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    stroke: #333;
    /*
    replace "Label" with [myPropertyName]
    to get a label from feature data
    */
    label: "Label";
    label-anchor: 0.5 0.5;
    label-conflict-resolution: true;
    label-follow-line: true;
    label-max-angle-delta: 90;
    label-max-displacement: 400;
    label-repeat: 150;
    /* move label at the bottom of the line*/
    /* label-offset: 20; */

    font-fill: #000;
    font-family: "sans-serif";
    font-size: 20;
    /* font-weight: bold; */
    /* font-style: italic; */

    halo-color: #fff;
    halo-radius: 4;
}
`,
        types: ['linestring', 'vector'],
        title: 'Label Follow Line',
        format: 'css',
        preview: <SVGPreview
            type="linestring"
            paths={[{
                stroke: "#333",
                strokeWidth: 4
            }]}
            texts={[
                {
                    text: 'Label',
                    transform: 'translate(100, 100) rotate(-60) translate(-120, -130)',
                    style: {
                        fontSize: 30,
                        fontWeight: 'bold',
                        strokeWidth: 12,
                        stroke: '#ffffff'
                    }
                },
                {
                    text: 'Label',
                    fill: '#000000',
                    transform: 'translate(100, 100) rotate(-60) translate(-120, -130)',
                    style: {
                        fontSize: 30,
                        fontWeight: 'bold',
                        strokeWidth: 1,
                        stroke: '#000000'
                    }
                }
            ]}
        />
    },

    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    fill: #ddd;
}
`,
        types: ['polygon', 'vector'],
        title: 'Fill',
        format: 'css',
        preview: <SVGPreview type="polygon" paths={[{ fill: "#ddd"}]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    stroke: #333;
    stroke-width: 1;
}
`,
        types: ['polygon', 'vector'],
        title: 'Border',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "transparent",
                stroke: "#333",
                strokeWidth: 4
            }]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    stroke: #333;
    stroke-dasharray: 10 5;
    stroke-width: 2;
    stroke-opacity: 0.5;
}
`,
        types: ['polygon', 'vector'],
        title: 'Dashed Border',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "transparent",
                stroke: "#333",
                strokeWidth: 4,
                strokeDasharray: "20 10",
                strokeOpacity: 0.5
            }]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    fill: #ddd;
    stroke: #333;
    stroke-width: 1;
}
`,
        types: ['polygon', 'vector'],
        title: 'Simple',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "#ddd",
                stroke: "#333",
                strokeWidth: 4
            }]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    fill: symbol("shape://slash");
    /* fill: symbol("shape://vertline"); */
    /* fill: symbol("shape://horline"); */
    /* fill: symbol("shape://slash"); */
    /* fill: symbol("shape://backslash"); */
    /* fill: symbol("shape://plus"); */
    /* fill: symbol("shape://times"); */
    :fill {
        size: 8;
        stroke: #000;
        stroke-width: 1;
        stroke-linecap: round;
    };
}
`,
        types: ['polygon', 'vector'],
        title: 'Line Pattern',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "url(#line)"
            }]}
            patterns={[{
                id: 'line',
                icon: {
                    d: 'M0.0 1.0 L1.0 0.0',
                    stroke: '#000',
                    strokeWidth: 0.05
                }
            }]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    fill: symbol("shape://dot");
    :fill {
        size: 8;
        stroke: black;
        stroke-width: 4;
    };
}
`,
        types: ['polygon', 'vector'],
        title: 'Dot Pattern',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "url(#poly_dot)"
            }]}
            patterns={[{
                id: 'poly_dot',
                icon: {
                    d: 'M0.5 0.5 L0.5 0.52Z',
                    stroke: '#000',
                    strokeLinecap: 'round',
                    strokeWidth: 0.2
                }
            }]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
	mark: symbol("circle");
    /* mark: symbol("square"); */
    /* mark: symbol("circle"); */
    /* mark: symbol("triangle"); */
    /* mark: symbol("star"); */
    /* mark: symbol("cross"); */
    /* mark: symbol("x"); */
    stroke: #333333;
    stroke-width: 0.5;
    :mark {
        size: 16;
        stroke: #333;
        stroke-width: 2;
        fill: #ddd;
    };
}
`,
        types: ['polygon', 'vector'],
        title: 'Marker',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "transparent",
                stroke: "#333"
            },
            {type: 'point', d: 'M 160,100 A 60,60 0 0 1 100,160 60,60 0 0 1 40,100 60,60 0 0 1 100,40 60,60 0 0 1 160,100 Z', stroke: '#333', fill: "#ddd", strokeWidth: 4}]}/>
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    fill: #ddd, symbol("square");
    graphic-margin: 2;
    /* mark: symbol("circle"); */
    /* mark: symbol("triangle"); */
    /* mark: symbol("star"); */
    /* mark: symbol("cross"); */
    /* mark: symbol("x"); */
    :fill {
        size: 20;
        stroke: #333;
        stroke-width: 1;
        fill: #f2f2f2;
    };
}
`,
        types: ['polygon', 'vector'],
        title: 'Fill Pattern',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "#ddd"
            }, {
                fill: "url(#poly_square)"
            }]}
            patterns={[{
                id: 'poly_square',
                icon: {
                    d: 'M0.1 0.1 L0.9 0.1 L0.9 0.9 L0.1 0.9Z',
                    stroke: '#333',
                    strokeLinecap: 'round',
                    strokeWidth: 0.05,
                    fill: '#f2f2f2'
                }
            }]}/>
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    stroke:  #555555, #000000;
    stroke-offset: 0, -5;
    stroke-dasharray: 1 0, 8 4;
    stroke-width: 0.5, 1;
}
`,
        types: ['polygon', 'vector'],
        title: 'Section',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "transparent",
                stroke: "#555555",
                strokeWidth: 2
            }, {
                type: 'point',
                fill: "transparent",
                stroke: "#000000",
                strokeDasharray: "32 16",
                d: 'M30 30 L170 30 L170 170 L30 170Z',
                strokeWidth: 4
            }]}/>
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    fill: symbol("shape://dot");
    :fill {
      size: 8;
      stroke: #333;
      stroke-width: 2;
    };
    stroke: #333;
    stroke-width: 0.5;
    stroke-dasharray: 1;
    fill-random: free;
    fill-random-seed: 5;
    fill-random-rotation: none;
    fill-random-symbol-count: 200;
    fill-random-tile-size: 100;
}
`,
        types: ['polygon', 'vector'],
        title: 'Random Dots',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: "transparent",
                stroke: "#333",
                strokeDasharray: "4 4",
                strokeWidth: 2
            }, {fill: "url(#random_dots)"}]}
            patterns={[
                {
                    id: 'random_dots',
                    image: {
                        xlinkHref: randomDots,
                        height: 256,
                        width: 256
                    }
                }
            ]}/>
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    /*
    replace "Label" with [myPropertyName]
    to get a label from feature data
    */
    label: "Label";
    label-anchor: 0.5 0.5;

    font-fill: #000;
    font-family: "sans-serif";
    font-size: 20;

    halo-color: #fff;
    halo-radius: 4;

    stroke: #474747;
    fill: symbol("shape://slash");
    :fill {
        size: 8;
        stroke: #000;
        stroke-width: 1;
        stroke-linecap: round;
    };
}
`,
        types: ['polygon', 'vector'],
        title: 'Label and Fill',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                fill: 'transparent',
                stroke: "#000",
                strokeWidth: 2
            }, {
                fill: "url(#line)"
            }]}
            texts={[
                {
                    text: 'Label',
                    style: {
                        fontSize: 50,
                        fontWeight: 'bold',
                        strokeWidth: 12,
                        stroke: '#ffffff'
                    }
                },
                {
                    text: 'Label',
                    fill: '#000000',

                    style: {
                        fontSize: 50,
                        fontWeight: 'bold',
                        strokeWidth: 1,
                        stroke: '#000000'
                    }
                }
            ]}/>
    },
    {
        types: ['point', 'vector'],
        title: 'Square',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol(square);\n\t:mark {\n\t\tstroke: #ff338f;\n\t\tfill: #bcedff;\n\t};\n}",
        preview: <SVGPreview
            type="point"
            paths={[{d: 'M40 40 L160 40 L160 160 L40 160Z', stroke: '#ff338f', fill: "#bcedff", strokeWidth: 4}]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Circle',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol(circle);\n\t:mark {\n\t\tstroke: #ff338f;\n\t\tfill: #bcedff;\n\t};\n}",
        preview: <SVGPreview
            type="point"
            paths={[{d: 'M 160,100 A 60,60 0 0 1 100,160 60,60 0 0 1 40,100 60,60 0 0 1 100,40 60,60 0 0 1 160,100 Z', stroke: '#ff338f', fill: "#bcedff", strokeWidth: 4}]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Triangle',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol(triangle);\n\t:mark {\n\t\tstroke: #ff338f;\n\t\tfill: #bcedff;\n\t};\n}",
        preview: <SVGPreview
            type="point"
            paths={[{d: 'M 160,151.96151 H 40 L 99.999999,48.038488 Z', stroke: '#ff338f', fill: "#bcedff", strokeWidth: 4}]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Star',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol(star);\n\t:mark {\n\t\tstroke: #ff338f;\n\t\tfill: #bcedff;\n\t};\n}",
        preview: <SVGPreview
            type="point"
            paths={[{
                d: 'M 165.07677,84.40286 131.87672,116.49613 139.49277,162.03972 98.710865,140.38195 57.749838,161.699 65.745291,116.22048 32.813927,83.851564 78.537289,77.40206 99.145626,36.079922 119.40876,77.572419 Z',
                stroke: '#ff338f', fill: "#bcedff", strokeWidth: 4}]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Cross',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol(cross);\n\t:mark {\n\t\tstroke: #ff338f;\n\t\tfill: #bcedff;\n\t};\n}",
        preview: <SVGPreview
            type="point"
            paths={[{
                d: 'M 84.99987,39.999998 V 84.999868 H 39.999999 V 115.00013 H 84.99987 V 160 H 115.00013 V 115.00013 H 160 V 84.999868 H 115.00013 V 39.999998 Z',
                stroke: '#ff338f',
                fill: "#bcedff",
                strokeWidth: 4
            }]} />
    },
    {
        types: ['point', 'vector'],
        title: 'X',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol(x);\n\t:mark {\n\t\tstroke: #ff338f;\n\t\tfill: #bcedff;\n\t};\n}",
        preview: <SVGPreview
            type="point"
            paths={[{
                d: 'M 131.81971,46.966899 100,78.786612 68.180288,46.966898 46.966899,68.180287 78.786613,100 46.9669,131.81971 68.180287,153.0331 100,121.21339 131.81971,153.0331 153.0331,131.81971 121.21339,99.999999 153.0331,68.180286 Z',
                stroke: '#ff338f',
                fill: "#bcedff",
                strokeWidth: 4
            }]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Line',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol('shape://vertline');\n\t:mark { stroke: #ff338f; };\n}",
        preview: <SVGPreview
            type="point"
            paths={[{
                d: 'M 100,40 V 160 Z',
                stroke: '#ff338f',
                strokeWidth: 4,
                fill: 'none'
            }]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Plus',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol('shape://plus');\n\t:mark { stroke: #ff338f; };\n}",
        preview: <SVGPreview
            type="point"
            paths={[{
                d: 'M 100,40 V 160 Z',
                stroke: '#ff338f',
                strokeWidth: 4,
                fill: 'none'
            }, {
                d: 'M 160,100 40.000002,100 Z',
                stroke: '#ff338f',
                strokeWidth: 4,
                fill: 'none'
            }]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Times',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol('shape://times');\n\t:mark { stroke: #ff338f; };\n}",
        preview: <SVGPreview
            type="point"
            paths={[{
                d: 'M 142.42641,57.573591 57.573595,142.4264 Z',
                stroke: '#ff338f',
                strokeWidth: 4,
                fill: 'none'
            }, {
                d: 'M 142.42641,142.42641 57.573595,57.573594 Z',
                stroke: '#ff338f',
                strokeWidth: 4,
                fill: 'none'
            }]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Open arrow',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol('shape://oarrow');\n\t:mark { stroke: #ff338f; };\n}",
        preview: <SVGPreview
            type="point"
            paths={[{
                d: 'M 40.027335,53.266123 159.77305,100 40.027335,146.73388',
                stroke: '#ff338f',
                strokeWidth: 4,
                fill: 'none'
            }]} />
    },
    {
        types: ['point', 'vector'],
        title: 'Closed arrow',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n * {\n\tmark: symbol('shape://carrow');\n\t:mark { stroke: #ff338f; };\n}",
        preview: <SVGPreview
            type="point"
            paths={[{
                d: 'M 40.027335,53.266123 159.77305,100 40.027335,146.73388Z',
                stroke: '#ff338f',
                strokeWidth: 4,
                fill: 'none'
            }]} />
    },
    {
        code:
`@styleTitle '\${styleTitle}';
@styleAbstract '\${styleAbstract}';

* {
    /*
    replace "Label" with [myPropertyName]
    to get a label from feature data
    */
    label: "Label";
    label-anchor: 0.5 2;
    /* label-group: true; */
    label-conflict-resolution: false;

    font-fill: #000;
    font-family: "sans-serif";
    /* font-weight: bold; */
    /* font-style: italic; */
    font-size: 20;

    halo-color: #fff;
    halo-radius: 4;

    mark: symbol("circle"), symbol("circle");
    :mark {
        size: 7, 3;
        stroke: #0d0d0d;
        stroke-width: 0.7;
    };
}
`,
        types: ['polygon', 'point', 'vector'],
        title: 'Label and Marker',
        format: 'css',
        preview: <SVGPreview
            type="polygon"
            paths={[{
                type: 'point',
                d: 'M 100, 100 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
                stroke: '#0d0d0d',
                fill: "transparent",
                strokeWidth: 2
            }, {
                type: 'point',
                d: 'M 100, 100 m -4, 0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0',
                stroke: '#0d0d0d',
                fill: "transparent",
                strokeWidth: 2
            }]}
            texts={[
                {
                    text: 'Label',
                    y: 150,
                    style: {
                        fontSize: 50,
                        fontWeight: 'bold',
                        strokeWidth: 12,
                        stroke: '#ffffff'
                    }
                },
                {
                    text: 'Label',
                    fill: '#000000',
                    y: 150,
                    style: {
                        fontSize: 50,
                        fontWeight: 'bold',
                        strokeWidth: 1,
                        stroke: '#000000'
                    }
                }
            ]}/>
    }
].map(style => ({ ...style, styleId: uuidv1() }));

module.exports = {
    baseTemplates,
    customTemplates
};
