/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import DOMPurify from 'dompurify';

// Prevent tabnabbing: target="_blank" links without rel="noopener" allow the opened
// page to navigate the original tab via window.opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

// Decode CSS backslash escapes (e.g. `u\72 l(` → `url(`) so escaped syntax
// can't smuggle external-resource loaders past the checks below.
const decodeCssEscapes = (css) => css
    // A hex escape consumes one optional trailing whitespace; per CSS Syntax that
    // whitespace set is space/tab/newline/carriage-return/form-feed, and \r\n counts
    // as a single terminator. Match the browser exactly, else escaped url()/@import
    // decode differently here than in the CSS parser and slip past the checks.
    .replace(/\\([0-9a-fA-F]{1,6})(?:\r\n|[ \t\n\r\f])?/g, (match, hex) => {
        const codePoint = parseInt(hex, 16);
        return codePoint > 0 && codePoint <= 0x10FFFF ? String.fromCodePoint(codePoint) : '�';
    })
    .replace(/\\([^0-9a-fA-F\n])/g, '$1');

// Sanitize CSS inside <style> elements: strip @import and image-set() (external
// resource loading) and url() with non-data schemes (data exfiltration via
// background-image). Escapes are decoded first so `\75rl(` can't bypass the checks.
// <style> is needed for GetFeatureInfo HTML responses from WMS servers (HTMLViewer).
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'style') {
        const decoded = decodeCssEscapes(node.textContent);
        const dangerous = /@import|image-set\s*\(|url\s*\(\s*(?!['"]?data:)/i;
        if (dangerous.test(decoded)) {
            node.textContent = decoded
                .replace(/@import[^;]*;?/gi, '')
                .replace(/(-webkit-)?image-set\s*\([^)]*\)/gi, 'none')
                .replace(/url\s*\(\s*(?!['"]?data:)[^)]*\)/gi, 'none');
        }
    }
});

// Harden iframe elements that survive sanitization
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'IFRAME') {
        /**
         * Sandbox the iframe without allow-same-origin (prevents access to parent
         * cookies/localStorage) and without allow-popups (prevents popup-based
         * phishing). allow-presentation is sufficient for YouTube/Vimeo fullscreen.
         */
        node.setAttribute('sandbox', 'allow-scripts allow-presentation');
        node.removeAttribute('allow-top-navigation');
        node.setAttribute('referrerpolicy', 'no-referrer');
        const src = node.getAttribute('src');
        if (src && src.startsWith('http:') && !src.includes('localhost')) {
            node.setAttribute('src', src.replace('http:', 'https:'));
        }
    }
});

const HTML_CONFIG = {
    ALLOWED_TAGS: [
        // Block elements
        'p', 'div', 'span', 'br',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'blockquote', 'pre', 'code',
        'figure', 'figcaption', 'hr', 'details', 'summary',
        // Inline formatting — current HTML5
        'b', 'i', 'u', 's', 'strong', 'em', 'small', 'mark', 'abbr', 'sup', 'sub',
        // Inline formatting — deprecated but common in stored content
        'font', 'center', 'strike',
        // Media and links
        'img', 'a', 'iframe',
        // Tables — full set including legacy presentation elements
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
        // Style blocks — needed for GetFeatureInfo HTML from WMS (sanitized via uponSanitizeElement hook above)
        'style'
    ],
    ALLOWED_ATTR: [
        // Common
        'src', 'alt', 'title', 'width', 'height', 'class', 'id', 'style',
        // Links
        'href', 'target', 'rel', 'name',
        // Iframe
        'frameborder', 'allowfullscreen', 'sandbox', 'referrerpolicy', 'loading',
        // Tables — current
        'colspan', 'rowspan',
        // Tables — deprecated presentation attrs common in GeoServer GetFeatureInfo output
        'align', 'valign', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'summary',
        // Lists
        'type', 'start',
        // Text direction / language
        'lang', 'dir',
        // Font tag attributes (deprecated but present in old stored content)
        'color', 'face', 'size',
        // GeoStory scroll-to-section interaction links (onclick is stripped; handled via event delegation in Text.jsx)
        'data-geostory-interaction-type', 'data-geostory-interaction-params', 'data-geostory-interaction-name'
    ],
    ADD_ATTR: ['allow'],
    FORCE_BODY: true
};

/**
 * Sanitize an untrusted HTML string before rendering via dangerouslySetInnerHTML.
 * Strips script elements, dangerous event-handler attributes, and javascript: URIs.
 * Iframes are preserved but hardened (sandbox, referrerpolicy, https-only src).
 * @param {string} dirty - untrusted HTML string
 * @returns {string} sanitized HTML string
 */
export const sanitizeHtml = (dirty) => DOMPurify.sanitize(dirty ?? '', HTML_CONFIG);
