/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import SafeHtml from './SafeHtml';

/**
 * Render the given html code into a <div>
 *
 * Properties:
 *  - html: {string} a html string
 *  - id: {string} a custom id for this component
 */
const HtmlRenderer = ({ html, id, style = { color: '#000000' } }) => (
    <SafeHtml html={html} id={id} style={style} />
);

HtmlRenderer.propTypes = {
    html: PropTypes.string,
    id: PropTypes.string,
    style: PropTypes.object
};

export default HtmlRenderer;
