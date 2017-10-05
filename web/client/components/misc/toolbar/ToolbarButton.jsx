 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {Button, Glyphicon} = require('react-bootstrap');
const tooltip = require('../enhancers/tooltip');
/**
 * Button for @see components.misc.toolbar.Toolbar. Exposes all the props of a react-bootstrap button, plus glyph and text
 * @class TooltipButton
 * @memberof components.misc.toolbar
 * @prop glyph [glyph] the icon to use
 * @prop text [text] the text to display
 */
module.exports = tooltip(({glyph, text="", ...props} = {}) =>
    <Button {...props}>
        {glyph ? <Glyphicon glyph={glyph}/> : null}
        {text}
    </Button>);
