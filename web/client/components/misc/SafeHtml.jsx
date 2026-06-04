/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { sanitizeHtml } from '../../utils/HtmlSanitizer';

/**
 * Renders an untrusted HTML string in a div after sanitizing it with DOMPurify.
 * Use this instead of dangerouslySetInnerHTML directly on HTML from user input.
 * All standard div props (className, id, style, onClick, ...) are forwarded.
 *
 * @param {string} html - untrusted HTML string
 */
const SafeHtml = ({ html, ...rest }) => {
    // eslint-disable-next-line react/no-danger -- html is always run through sanitizeHtml before rendering
    return <div {...rest} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
};

export default SafeHtml;
