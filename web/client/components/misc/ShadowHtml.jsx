/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { sanitizeHtml } from '../../utils/HtmlSanitizer';

const CONTAINED_LAYOUT = { contain: 'paint', overflow: 'auto' };

/**
 * Renders an HTML fragment inside a shadow root, so any <style> block it carries
 * (e.g. from a WMS GetFeatureInfo HTML response) is scoped to this subtree instead
 * of leaking into the whole document, and the application theme does not override
 * the server-provided styling. The host also contains the layout: the fragment is
 * painted and positioned inside the host box, and content wider than it scrolls.
 * The fragment has a shadow root of its own, nested in the one of the host: the rules
 * it writes for its host (`:host`, `@scope`) style the box of the fragment, and the
 * layout of the host stays the one set here.
 *
 * @param {string} html - untrusted HTML string
 */
const ShadowHtml = ({ html, id, style = { color: '#000000' } }) => {
    const hostRef = useRef(null);
    useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }
        const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
        const fragment = root.firstElementChild || root.appendChild(document.createElement('div'));
        const fragmentRoot = fragment.shadowRoot || fragment.attachShadow({ mode: 'open' });
        fragmentRoot.innerHTML = sanitizeHtml(html);
    }, [html]);
    // inherited properties (color, font) cross the shadow boundary from the host,
    // so the default text color is preserved for the injected content.
    return <div id={id} style={{ ...style, ...CONTAINED_LAYOUT }} ref={hostRef} />;
};

ShadowHtml.propTypes = {
    html: PropTypes.string,
    id: PropTypes.string,
    style: PropTypes.object
};

export default ShadowHtml;
