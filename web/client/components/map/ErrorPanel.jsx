/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import HTML from '../I18N/HTML';
import Message from '../I18N/Message';
import Button from '../misc/Button';
import { Alert } from 'react-bootstrap';

function ErrorPanel({
    show,
    error,
    onReload
}) {
    if (!show) {
        return null;
    }
    return (
        <div
            className="ms-map-error-panel"
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                color: '#ffffff',
                background: 'rgba(0, 0, 0, 0.75)',
                zIndex: 100,
                top: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
            <div style={{ maxWidth: 500 }}>
                <h1><HTML msgId="map.renderingErrorTitle" /></h1>
                <p><HTML msgId="map.renderingErrorMessage" /></p>
                {error?.message && <Alert bsStyle="danger">
                    <small>
                        {error.message}
                    </small>
                </Alert>}
                {onReload && <Button
                    bsStyle="primary"
                    onClick={() => onReload()}
                >
                    <Message msgId="map.reloadMap" />
                </Button>}
            </div>
        </div>
    );
}

export default ErrorPanel;
