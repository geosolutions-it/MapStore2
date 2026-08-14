/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Rejects javascript:/data:/vbscript:/file: URIs and other unsafe hrefs, allowing only:
 *  - same-site relative paths ("/foo", "?x=1", "#hash")
 *  - absolute URLs with an allow-listed protocol (http, https, mailto, tel)
 * Empty string is returned for anything rejected so callers can render the fallback.
 * Prevents anchor XSS (React does not sanitize the href attribute).
 * @param {string} href candidate href value
 * @returns {string} sanitized href, or '' if unsafe
 */
export function sanitizeHref(href) {
    if (typeof href !== 'string' || !href.trim()) return '';
    const t = href.trim();
    if (/[\u0000-\u001F\u007F-\u009F\s]/.test(t)) return '';
    if (t.startsWith('#') || t.startsWith('/') || t.startsWith('?')) {
        return /^\/[/\\]/.test(t) ? '' : t;
    }
    try {
        const u = new URL(t, window.location.origin);
        return SAFE_PROTOCOLS.includes(u.protocol) ? t : '';
    } catch (e) { return ''; }
}

function ALink({ href, readOnly, children, fallbackComponent, ...props }) {
    const FallbackComponent = fallbackComponent || React.Fragment;
    const safeHref = sanitizeHref(href);
    return readOnly || !safeHref ? <FallbackComponent {...props}>{children}</FallbackComponent> : <a href={safeHref} {...props}>{children}</a>;
}

ALink.propTypes = {
    href: PropTypes.string,
    readOnly: PropTypes.bool.isRequired,
    children: PropTypes.any
};

ALink.defaultProps = {
    href: '',
    readOnly: false
};

export default ALink;
