/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const emptyState = require('../misc/enhancers/emptyState');
const Message = require('../I18N/Message');
const HTML = require('../I18N/HTML');

/**
 * ResourceUnavailable is an error view like the typical 404 not found page, or access denied.
 *
 * @memberof plugins
 * @memberof components.ResourceUnavailable
 * @class
 * @prop {boolean} enabled. enable empty state of component combined with alwaysVisible, login or status !== 403.
 * @prop {boolean} login login status true or false
 * @prop {number} status error code 404 or 403
 * @prop {boolean} alwaysVisible set empty state always visible, needs enable to true
 * @prop {string} mode mode types referred to the page view, default 'map'
 * @prop {object} glyphs key represents the mode and the value the name of glyph, default {map: '1-map', dashboard: 'dashboard'}
 * @prop {string} errorMessage error message to display in description
 * @prop {boolean} showHomeButton enable/disable home button
 * @prop {node} homeButton home button to render in content section of empty state
 *
 */

const ResourceUnavailable = emptyState(
    ({enabled, login, status, alwaysVisible, isSharedStory}) => enabled && alwaysVisible || enabled && login || enabled && status !== 403 || enabled && status === 403 && isSharedStory,
    ({status, mode = 'map', glyphs = {map: '1-map', dashboard: 'dashboard'}, errorMessage, errorMessageParams, showHomeButton, homeButton}) => ({
        glyph: glyphs[mode] || '1-map',
        title: status === 403 && <Message msgId={`${mode}.errors.loading.notAccessible`} />
        || status === 404 && <Message msgId={`${mode}.errors.loading.notFound`} />
        || <Message msgId={`${mode}.errors.loading.title`} />,
        description: (
            <div className="text-center">
                {errorMessage && <Message msgId={errorMessage} msgParams={errorMessageParams} />
                || <HTML msgId={`${mode}.errors.loading.unknownError`} />}
            </div>
        ),
        content: showHomeButton && homeButton && <div className="text-center">{homeButton}</div>
    })
)(() => null);

module.exports = ResourceUnavailable;
