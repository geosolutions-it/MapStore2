/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Sidebar = require('react-sidebar').default;
/**
 * MapStore generic sidebar component with good defaults
 * @class Sidebar
 * @memberof components.misc.sidebar
 * @param  {boolean} open       Open flag
 * @param  {Number} [width=600] Width of the sidebar
 * @param  {node} children      Content
 */
module.exports = ({open, width = 600, children, ...props} = {}) => (<Sidebar
    open={open}
    sidebarClassName="sidepanel-content"
    sidebar={children}
    styles={{
        sidebar: {
            zIndex: 1024,
            width
        },
        overlay: {
            zIndex: 1023,
            width: 0
        },
        root: {
            right: open ? 0 : 'auto',
            width: '0',
            overflow: 'visible'
        },
        content: {
            overflowY: 'auto'
        }
    }}
    {...props}
>
    <div/>
</Sidebar>);
