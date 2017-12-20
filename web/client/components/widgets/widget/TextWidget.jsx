/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const WidgetContainer = require('./WidgetContainer');
module.exports = ({id, title, text} = {}) =>
(<WidgetContainer id={`widget-text-${id}`} title={title}>
    <div dangerouslySetInnerHTML={{__html: text || "No text"}}></div>;}
    </WidgetContainer>

);
