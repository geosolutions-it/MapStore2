/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const ContainerDimensions = require('react-container-dimensions').default;
const Loader = require('./Loader');

/**
 * Default Loading View component
 * @param  {number} width  fixed width
 * @param  {number} height fixed height
 * @param  {string} size size. One of full or small
 * @param  {String} [className="loader-container"] className for the container
 * @param  {Object} [contentStyle={}}]             object to customize content style
 */
module.exports = ({width: ww, height: hh, className = "loader-container", contentStyle = {}}) => (<div className={className} >
    <ContainerDimensions>
        {({width = 200, height = 200}) => {
            const w = ww || (height > 0 ? Math.min(width, height) : width);
            const h = hh || (height > 0 ? Math.min(width, height) : width);
            const size = Math.min(w, h);
            return <Loader size={size} style={{ padding: size / 10, margin: "auto", display: "flex", ...contentStyle }} />;
        }}
    </ContainerDimensions>
</div>);
