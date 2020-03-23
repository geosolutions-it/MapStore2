/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Message from '../I18N/Message';

/**
 * This component is rendered when a runtime error occurs
 * see https://github.com/geosolutions-it/MapStore2/issues/4491
 */
const ErrorBoundaryFallbackComponent = () => {
    return (
        <div className="runtime-error-message">
            <div>
                <Glyphicon
                    className="exclamation-sign-icon"
                    glyph="exclamation-sign"/>
                <h1><Message msgId="errorPage.title"/></h1>
                <p>
                    <Message msgId="errorPage.subtitle"/>
                    <p>
                        <Glyphicon
                            glyph="refresh"
                            className="refresh-icon"
                            onClick={() => {
                                window.location.href = "/";
                            }}
                        />
                    </p>
                </p>
                <p>
                    <Message msgId="errorPage.description"/>
                    <h6><a target="_blank" href="https://groups.google.com/forum/#!forum/mapstore-users"><Message msgId="errorPage.descriptionLink"/></a></h6>
                </p>
            </div>
        </div>);
};


export default ErrorBoundaryFallbackComponent;
