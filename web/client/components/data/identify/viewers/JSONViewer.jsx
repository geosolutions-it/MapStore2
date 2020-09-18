/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {shouldUpdate} = require('recompose');

const Viewers = {
    TEMPLATE: require('./TemplateViewer'),
    PROPERTIES: require('./PropertiesViewer')
};

module.exports = shouldUpdate((props, nextProps) => nextProps.response !== props.response || nextProps.gfiType !== props.gfiType)(
    props => {
        const type = props.layer?.[props.gfiType]?.format && (props.layer[props.gfiType].template && props.layer[props.gfiType].template !== '<p><br></p>') && props.layer[props.gfiType].format || 'PROPERTIES';
        const Viewer = Viewers[type] || Viewers.PROPERTIES;
        return <Viewer {...props}/>;
    }
);
