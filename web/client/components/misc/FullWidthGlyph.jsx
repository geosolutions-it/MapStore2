 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const React = require('react');
const {Glyphicon} = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;

/**
 * An icon that fits to the width of the container
 * @param {string} glyph icon glyph
 */
module.exports = ({glyph = "info-sign"}) => (<ContainerDimensions>
    { ({ width }) => (<Glyphicon glyph={glyph} style={{fontSize: width}} />)}
</ContainerDimensions>);
