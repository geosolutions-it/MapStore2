/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { createPlugin } from '../utils/PluginsUtils';
import FlexBox from '../components/layout/FlexBox';
import usePluginItems from "../hooks/usePluginItems";

const fixedTools = [
    { name: 'Attribution', target: 'left-footer', position: 0, Component: () => <div key="attribution" id="footer-attribution-container" /> },
    { name: 'ScaleBar', target: 'right-footer', position: 0, Component: () => <div key="scalebar" id="footer-scalebar-container" /> }
];

/**
 * Footer for MapViewer. Can contain several plugins.
 * @name MapFooter
 * @class
 * @memberof plugins
 */
function MapFooter({
    className,
    style,
    items,
    id
}, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });
    const allItems = [...fixedTools, ...configuredItems].sort((a, b) => a.position - b.position);
    const leftFooterItems = allItems.filter(({ target }) => target === 'left-footer');
    const rightFooterItems = allItems.filter(({ target }) => target === 'right-footer');
    return (
        <FlexBox id={id} className={className} style={style} classNames={['_padding-xs']} gap="sm" wrap centerChildrenVertically>
            <FlexBox.Fill flexBox gap="sm" centerChildrenVertically>
                {leftFooterItems.map(({ name, Component }) => <Component key={name} />)}
            </FlexBox.Fill>
            <FlexBox gap="sm" wrap centerChildrenVertically>
                {rightFooterItems.map(({ name, Component }) => <Component key={name} />)}
            </FlexBox>
        </FlexBox>
    );
}

MapFooter.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    items: PropTypes.array,
    id: PropTypes.string
};

MapFooter.defaultProps = {
    items: [],
    className: "mapstore-map-footer",
    style: {},
    id: "mapstore-map-footer"
};

MapFooter.contextTypes = {
    loadedPlugins: PropTypes.object
};

export default createPlugin('MapFooter', {
    component: MapFooter
});
