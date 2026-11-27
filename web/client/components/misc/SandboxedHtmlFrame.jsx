/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ConfigUtils from '../../utils/ConfigUtils';
import axios from '../../libs/ajax';

/**
 * Sandbox flags of the frame. They are fixed and must never include allow-same-origin:
 * a srcdoc document inherits the application origin, so with that flag its scripts
 * could reach the application and remove the sandbox.
 * Popups escape the sandbox so links opened in a new tab behave as normal pages.
 */
export const HTML_FRAME_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';
export const HTML_FRAME_HEIGHT_MESSAGE = 'ms-html-frame-height';
export const HTML_FRAME_MIN_HEIGHT = 50;
export const HTML_FRAME_MAX_HEIGHT = 2000;

// Runs inside the frame and reports the content height, since the opaque origin
// does not let the parent read the frame document. It groups changes in short
// intervals and sends a message only when the height changes. A timer is used
// instead of requestAnimationFrame, which browsers pause in frames out of view.
const HEIGHT_REPORTER = `(function () {
    var last = -1;
    var pending = false;
    var send = function () {
        pending = false;
        var height = document.documentElement.scrollHeight;
        if (height !== last) {
            last = height;
            parent.postMessage({ type: '${HTML_FRAME_HEIGHT_MESSAGE}', height: height }, '*');
        }
    };
    var schedule = function () {
        if (!pending) {
            pending = true;
            setTimeout(send, 50);
        }
    };
    if (window.ResizeObserver) {
        new ResizeObserver(schedule).observe(document.documentElement);
    }
    window.addEventListener('load', schedule);
})();`;

const clampHeight = (height) => Math.min(Math.max(Math.round(height), HTML_FRAME_MIN_HEIGHT), HTML_FRAME_MAX_HEIGHT);

const getTheme = () => {
    const links = [...document.querySelectorAll('#theme_stylesheet, link[data-ms-context-theme]')];
    const variables = getComputedStyle(document.documentElement);
    return {
        links: links.map((link) => link.href),
        prefix: __MAPSTORE_PROJECT_CONFIG__.themePrefix || ConfigUtils.getConfigProp('themePrefix') || 'ms2',
        variables: Array.from(variables).filter((name) => name.startsWith('--ms-'))
            .map((name) => `${name}: ${variables.getPropertyValue(name)};`).join('\n')
    };
};

const prepareHtml = (html, theme) => {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    const base = doc.createElement('base');
    base.target = '_blank';
    doc.head.prepend(base);
    if (theme) {
        doc.body.classList.add(theme.prefix);
        doc.body.setAttribute('data-ms2-container', 'ms2');
        theme.styles.slice().reverse().forEach((css) => {
            const style = doc.createElement('style');
            style.textContent = css;
            doc.head.prepend(style);
        });
        if (theme.variables) {
            const style = doc.createElement('style');
            style.textContent = `:root { ${theme.variables} }`;
            doc.head.appendChild(style);
        }
    }
    const heightReporter = doc.createElement('script');
    heightReporter.textContent = HEIGHT_REPORTER;
    doc.body.appendChild(heightReporter);
    const doctype = doc.doctype ? new XMLSerializer().serializeToString(doc.doctype) : '';
    return doctype + doc.documentElement.outerHTML;
};

/**
 * Renders an untrusted HTML document in a sandboxed iframe with an opaque origin.
 * The document keeps its own styles and scripts, but it cannot read or change the
 * application, its storage or the user session.
 * The frame height follows the content, within fixed limits, through a message
 * sent by the frame. Only messages from this frame are accepted.
 * The background is white by default, and can be styled by the applied theme.
 * @param {string} html - untrusted HTML document
 * @param {string} title - accessible title of the frame
 * @param {boolean} applyTheme - apply the current MapStore theme inside the frame
 */
const SandboxedHtmlFrame = ({ html, title, applyTheme }) => {
    const frameRef = useRef(null);
    const [height, setHeight] = useState(HTML_FRAME_MIN_HEIGHT);
    const [theme, setTheme] = useState(null);
    useEffect(() => {
        let active = true;
        const loadTheme = async() => {
            const next = getTheme();
            try {
                const styles = await Promise.all(next.links.map(async(href) => {
                    const { data: css } = await axios.get(href, { responseType: 'text' });
                    // Find CSS url(...) values, with or without quotes, and resolve relative paths
                    // against the original stylesheet.
                    const updatedCss = css.replace(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/g, (match, quote, url) => {
                        if (/^(data:|blob:|#)/i.test(url)) {
                            return match;
                        }
                        const resolvedUrl = new URL(url, href).href;
                        return `url("${resolvedUrl}")`;
                    });
                    return updatedCss;
                }));
                if (active) {
                    setTheme({ ...next, styles });
                }
            } catch (error) {
                console.error('Unable to apply the MapStore theme in the feature info frame', error);
            }
        };
        if (applyTheme) {
            loadTheme();
        } else {
            setTheme(null);
        }
        return () => {
            active = false;
        };
    }, [applyTheme]);
    useEffect(() => {
        const onMessage = (event) => {
            if (!frameRef.current || event.source !== frameRef.current.contentWindow) {
                return;
            }
            const reported = Number(event.data?.type === HTML_FRAME_HEIGHT_MESSAGE && event.data.height);
            if (reported > 0) {
                setHeight(clampHeight(reported));
            }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);
    return (
        <iframe
            ref={frameRef}
            className="ms-sandboxed-html-frame"
            title={title}
            sandbox={HTML_FRAME_SANDBOX}
            referrerPolicy="no-referrer"
            srcDoc={prepareHtml(html, applyTheme ? theme : null)}
            style={{ width: '100%', height, border: 'none', display: 'block', background: '#ffffff' }}
        />
    );
};

SandboxedHtmlFrame.propTypes = {
    html: PropTypes.string,
    title: PropTypes.string,
    applyTheme: PropTypes.bool
};

export default SandboxedHtmlFrame;
