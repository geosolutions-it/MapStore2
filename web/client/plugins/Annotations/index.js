/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { createPlugin } from '../../utils/PluginsUtils';
import epics from './epics/annotations';
import annotations from './reducers/annotations';
import AnnotationsEditor from './containers/AnnotationsEditor';
import AnnotationsPanel from './containers/AnnotationsPanel';
import AnnotationsTOCButton from './containers/AnnotationsTOCButton';

/**
  * Annotations Plugin. Implements annotations handling on maps.
  * @prop {object[]} lineDashOptions `[{value: [line1 gap1 line2 gap2 line3...]}, {...}]` defines how dashed lines are displayed.
  * Use values without unit identifier.
  * If an odd number of values is inserted then they are added again to reach an even number of values
  * for more information see [this page](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
  * @prop {string} defaultPointType default point type of marker geometry type. Can be `'marker'` or `'symbol'`
  * @prop {string} defaultShape the default symbol used when switching for the symbol styler
  * @prop {string} defaultShapeStrokeColor default symbol stroke color
  * @prop {string} defaultShapeFillColor default symbol fill color
  * @prop {number} defaultShapeSize default symbol shape size in px
  * @prop {string} format `'decimal'` or `'aeronautical'` degree for coordinates
  * @prop {string} defaultTextAnnotation default text value for text annotations (default: `'New'`)
  * @prop {object} geometryEditorOptions properties to be passed to `CoordinatesEditor` of `GeometryEditor`. For more information refer to the documentation of `CoordinatesEditor` component
  * @prop {string} symbolsPath the relative path to the symbols folder where `symbols.json` and SVGs are located (starting from the `index.html` folder, i.e. the root) `symbols.json` can be structured like [this](https://github.com/geosolutions-it/MapStore2/blob/90fb33465fd3ff56c4bbaafb5ab0ed492826622c/web/client/product/assets/symbols/symbols.json)
  * `symbols.json` present in `symbolsPath` folder is mandatory and it contains the list of symbols to be used in the Annotations Plugin
  * - width and height of SVGs should be 64px
  * - the `name` is related to the filename of the symbol (the file must be named `<name>.svg`).
  * - the `label` is the name used in the symbol dropdown menu
  * ```
  * [
  *   {"name": "filename", "label": "label"},
  *   {"name": "square", "label": "Square"}
  * ]
  * ```
  * @prop {boolean} geodesic **deprecated** draw geodesic annotation. By default `geodesic` is `true` (Currently applicable only for "circle" annotation type)
  * @prop {object[]} fields **deprecated** Available annotation fields (`title` and `description` are mandatory). A list of object specifying:
  *  - `name`: the field synthetic name
  *  - `type`: type of value for the field (`'text'` or `'html'`)
  *  - `validator`: (optional) function for rule for validation
  *  - `validationError`: (optional) id for the translations file containing the validation error message
  *  - `showLabel`: whether to show or not the label of the field in the viewer / editor
  *  - `editable`: whether the field can be edited or not in editing mode
  * @class Annotations
  * @memberof plugins
  * @static
  * @example
  * // Example of plugin configuration
  *
  *{
  *    "name": "Annotations",
  *    "cfg": {
  *        "defaultPointType": "symbol",
  *        "defaultShape": "traffic-cone",
  *        "defaultShapeStrokeColor": "#00ffff",
  *        "defaultShapeFillColor": "rgba(0, 255, 50, 0.5)",
  *        "defaultShapeSize": 128,
  *        "format": "aeronautical",
  *        "defaultTextAnnotation": "New",
  *        "geometryEditorOptions": {
  *            "measureOptions": {
  *                "displayUom": "nm"
  *            }
  *        },
  *        "lineDashOptions": [
  *            { "value": "0" },
  *            { "value": "1 4" },
  *            { "value": "1 12" },
  *            { "value": "8 8" }
  *        ],
  *        "symbolsPath": "product/assets/symbols/",
  *        "geodesic": true,
  *        "fields": [
  *            {
  *                "name": "title",
  *                "type": "text",
  *                "validator": "{(val) => val}",
  *                "validateError": "annotations.mandatory",
  *                "showLabel": true,
  *                "editable": true
  *            },
  *            {
  *                "name": "description",
  *                "type": "html",
  *                "showLabel": true,
  *                "editable": true
  *            },
  *            {
  *                "name": "myattribute",
  *                "type": "text",
  *                "editable": true,
  *                "showLabel": true,
  *                "validator": "{(value = '') => !value.includes('fake')}",
  *                "validateError": "annotations.error.fake"
  *            }
  *        ]
  *    }
  *}
  */
export default createPlugin('Annotations', {
    component: AnnotationsPanel,
    containers: {
        TOC: {
            doNotHide: true,
            name: 'Annotations',
            target: 'toolbar',
            Component: AnnotationsTOCButton,
            position: 12
        },
        Map: {
            name: 'Annotations',
            Tool: AnnotationsEditor,
            alwaysRender: true
        }
    },
    reducers: {
        annotations
    },
    epics
});
