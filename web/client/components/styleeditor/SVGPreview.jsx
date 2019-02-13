/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

/**
 * Component for rendering SVG previews for polygons, linestrings and points styles.
 * @memberof components.styleeditor
 * @name SVGPreview
 * @class
 * @prop {string} type geometry type, polygon, linestring or point
 * @prop {array} patterns defined paths to use as pattern in svg elements, id and icon keys needed, eg: [{id: 'tree', icon: { d: 'M0.1 0.9 L0.5 0.1 L0.9 0.9Z', fill: '#98c390'}}]
 * @prop {array} paths array of path object, type must be defined, eg: type='linestring' paths=[{stroke: '#999999', strokeWidth: 6}, {stroke: '#ffffff', strokeWidth: 2}]
 * @prop {array} texts array of text object, eg: [{ text: 'HELLO', fill: '#f2f2f2', style: {fontSize: 70, fontWeight: 'bold'}}]
 * @prop {string} backgroundColor background color of the preview
 * @example
 *
 * // point
 * <SVGPreview type="point" paths={[{d: 'M30 160 L100 40', stroke: '#999999'}]}/>
 *
 * // linestring
 * <SVGPreview type="linestring" paths={[{stroke: '#999999', strokeWidth: 6}, {stroke: '#ffffff', strokeWidth: 2}]}/>
 *
 * // polygon
 * <SVGPreview type="polygon" paths={[{ fill: "#c1ffb3"}]}/>
 *
 * // polygon with pattern
 * <SVGPreview type="polygon" paths={[{ fill: "#c1ffb3"}, {fill: "url(#tree)"}]} patterns={[{id: 'tree', icon: { d: 'M0.1 0.9 L0.5 0.1 L0.9 0.9Z', fill: '#98c390'}}]/>
 *
 * // text
 * <SVGPreview backgroundColor="#333333" texts={[{text: 'HELLO', fill: '#f2f2f2', style: {fontSize: 70, fontWeight: 'bold'}}]}/>
 *
 *
 */

const SVGPreview = ({ type, patterns, paths, texts, backgroundColor = '#ffffff' }) =>
    <svg viewBox="0 0 200 200">
        <defs>
            {patterns && patterns.filter(pattern => pattern.icon).map(pattern => <pattern id={pattern.id} viewBox="0 0 1 1" width="15%" height="15%">
                {pattern.icon && <path {...pattern.icon} />}
            </pattern>)}
            {patterns && patterns.filter(pattern => pattern.image).map(pattern => <pattern id={pattern.id} width="100%" height="100%">
                {pattern.image && <image {...pattern.image} />}
            </pattern>)}
        </defs>
        <path fill={backgroundColor} d={`M0 0 L200 0 L200 200 L0 200Z`} />
        {paths && paths.map(({type: pathType, ...props}) =>
            (pathType || type) === 'polygon' && <path {...props} d="M20 20 L180 20 L180 180 L20 180Z" />
            || (pathType || type) === 'linestring' && <path {...props} fill="none" d="M30 160 L100 40 L170 160" />
            || (pathType || type) === 'point' && <path {...props} />
        )}
        {texts && texts.map(({text, ...props}) => <text x="100" y="100" textAnchor="middle" alignmentBaseline="middle" {...props}>{text}</text>)}
    </svg>;

module.exports = SVGPreview;
