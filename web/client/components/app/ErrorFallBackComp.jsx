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
import ConfigUtils from '../../utils/ConfigUtils';

/**
 * This component is rendered when a runtime error occurs
 * see https://github.com/geosolutions-it/MapStore2/issues/4491
 */
const ErrorBoundaryFallbackComponent = ({mailingList = ConfigUtils.getConfigProp("mailingList") || ""}) => {
    return (
        <div className="runtime-error-message">
            <div>
                <Glyphicon
                    className="exclamation-sign-icon"
                    glyph="exclamation-sign"/>
                <h1><Message msgId="errorPage.title"/></h1>
                <p style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <Message msgId="errorPage.subtitle"/>
                    <Glyphicon
                        style={{marginTop: "20px" }}
                        glyph="refresh"
                        className="refresh-icon"
                        onClick={() => {
                            window.location.reload();
                        }}
                    />
                </p>
                <p>
                    {
                        mailingList ?
                            <a target="_blank" href={mailingList}>
                                <Message msgId="errorPage.description"/>
                            </a>
                            : <Message msgId="errorPage.descriptionAdmin"/>
                    }
                </p>
            </div>
        </div>);
};


export default ErrorBoundaryFallbackComponent;

