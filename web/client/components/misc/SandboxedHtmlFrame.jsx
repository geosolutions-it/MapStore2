/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

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
const HEIGHT_REPORTER = `<script>(function () {
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
})();</script>`;

const clampHeight = (height) => Math.min(Math.max(Math.round(height), HTML_FRAME_MIN_HEIGHT), HTML_FRAME_MAX_HEIGHT);

/**
 * Renders an untrusted HTML document in a sandboxed iframe with an opaque origin.
 * The document keeps its own styles and scripts, but it cannot read or change the
 * application, its storage or the user session.
 * The frame height follows the content, within fixed limits, through a message
 * sent by the frame. Only messages from this frame are accepted.
 * The background is white, as for a page opened on its own, whatever the theme.
 * @param {string} html - untrusted HTML document
 * @param {string} title - accessible title of the frame
 */
const SandboxedHtmlFrame = ({ html, title }) => {
    const frameRef = useRef(null);
    const [height, setHeight] = useState(HTML_FRAME_MIN_HEIGHT);
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
            srcDoc={(html || '') + HEIGHT_REPORTER}
            style={{ width: '100%', height, border: 'none', display: 'block', background: '#ffffff' }}
        />
    );
};

SandboxedHtmlFrame.propTypes = {
    html: PropTypes.string,
    title: PropTypes.string
};

export default SandboxedHtmlFrame;
