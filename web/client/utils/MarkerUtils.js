/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const csstree = require('css-tree');
const assign = require('object-assign');

const css = {
    fontawesome: require('raw-loader!./font-awesome.txt')
};

const getNodeOfType = (node, condition) => {
    if (condition(node)) {
        return node;
    }
    if (node.children) {
        return node.children.reduce((previous, current) => {
            const result = getNodeOfType(current, condition);
            return result || previous;
        }, null);
    }
    return null;
};

const glyphs = {};

const loadGlyphs = (font) => {
    const parsedCss = csstree.toPlainObject(csstree.parse(css[font]));
    return parsedCss.children.reduce((previous, rule) => {
        if (rule.prelude) {
            const classSelector = getNodeOfType(rule.prelude, (node) => node.type === 'ClassSelector');
            const pseudoClassSelector = getNodeOfType(rule.prelude, (node) => node.type === 'PseudoClassSelector');
            if (classSelector && classSelector.name && classSelector.name.indexOf('fa-') === 0 && pseudoClassSelector && pseudoClassSelector.name === 'before') {
                const text = getNodeOfType(getNodeOfType(rule.block, (node) => node.type === 'Declaration' && node.property === 'content').value, (node) => node.type === 'String').value;
                /* eslint-disable */
                return assign(previous, {
                    [classSelector.name.substring(3)]: eval("'\\u" + text.substring(2, text.length - 1) + "'")
                });
                /* eslint-enable */
            }
        }
        return previous;
    }, {});
};

const extraMarkers = {
    size: [36, 46],
    colors: ['red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'blue', 'cyan', 'purple', 'violet',
        'pink', 'green-dark', 'green', 'green-light', 'black'],
    shapes: ['circle', 'square', 'star', 'penta'],
    icons: [require('../components/mapcontrols/annotations/img/markers_default.png'), require('../components/mapcontrols/annotations/img/markers_shadow.png')]
};

const MarkerUtils = {
    extraMarkers: assign({}, extraMarkers, {
        getOffsets: (color, shape) => {
            return [-extraMarkers.colors.indexOf(color) * extraMarkers.size[0] - 2, -extraMarkers.shapes.indexOf(shape) * extraMarkers.size[1]];
        },
        matches: (style, marker) => {
            return style.iconColor === marker.color && style.iconShape === marker.shape;
        },
        getStyle: (marker) => {
            return {
                iconColor: marker.color,
                iconShape: marker.shape
            };
        }
    }),
    getGlyphs: (font) => {
        if (!glyphs[font]) {
            glyphs[font] = loadGlyphs(font);
        }
        return glyphs[font];
    }
};


module.exports = MarkerUtils;
