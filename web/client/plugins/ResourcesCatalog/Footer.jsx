/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { createPlugin } from "../../utils/PluginsUtils";
import Menu from './components/Menu';
import Button from '../../components/layout/Button';
import Spinner from '../../components/layout/Spinner';
import Icon from './components/Icon';
import HTML from '../../components/I18N/HTML';
import Message from '../../components/I18N/Message';
import FlexBox from '../../components/layout/FlexBox';
import usePluginItems from '../../hooks/usePluginItems';
import { withResizeDetector } from 'react-resize-detector';
function FooterMenuItem({
    className,
    loading,
    glyph,
    iconType,
    labelId,
    onClick,
    label
}) {
    return (
        <li>
            <Button
                onClick={onClick}
                className={className}
            >
                {loading ? <Spinner /> : <Icon glyph={glyph} type={iconType} />}
                {' '}
                {labelId ? <Message msgId={labelId} /> : label}
            </Button>
        </li>
    );
}

FooterMenuItem.propTypes = {
    className: PropTypes.string,
    loading: PropTypes.bool,
    glyph: PropTypes.string,
    iconType: PropTypes.string,
    labelId: PropTypes.string,
    onClick: PropTypes.func
};

FooterMenuItem.defaultProps = {
    iconType: 'glyphicon',
    onClick: () => { }
};

/**
 * This plugin shows the footer
 * @memberof plugins
 * @class
 * @name Footer
 * @prop {boolean} cfg.customFooter params that can be used to render a custom html to be used instead of the default one
 * @prop {string} cfg.customFooterMessageId replace custom footer translations message identifier
 * @prop {object[]} cfg.menuItems list of menu items objects
 * @prop {boolean} cfg.hideMenuItems hide menu items menu
 * @prop {object[]} items this property contains the items injected from the other plugins,
 * using the `containers` option in the plugin that want to inject new menu items.
 * ```javascript
 * const MyMenuItemComponent = connect(selector, { onActivateTool })(({
 *  component, // default component that provides a consistent UI (see BrandNavbarMenuItem in BrandNavbar plugin for props)
 *  variant, // one of style variant (primary, success, danger or warning)
 *  size, // button size
 *  className, // custom class name provided by configuration
 *  onActivateTool, // example of a custom connected action
 * }) => {
 *  const ItemComponent = component;
 *  return (
 *      <ItemComponent
 *          className="my-class-name"
 *          loading={false}
 *          glyph="heart"
 *          iconType="glyphicon"
 *          labelId="myMessageId"
 *          onClick={() => onActivateTool()}
 *      />
 *  );
 * });
 * createPlugin(
 *  'MyPlugin',
 *  {
 *      containers: {
 *          Footer: {
 *              name: "TOOLNAME", // a name for the current tool.
 *              target: 'menu',
 *              Component: MyMenuItemComponent
 *          },
 * // ...
 * ```
 * @example
 * {
 *  "name": "Footer",
 *  "cfg": {
 *      "menuItems": [
 *          {
 *              "type": "link",
 *              "href": "/my-link",
 *              "target": "blank",
 *              "glyph": "heart",
 *              "labelId": "myMessageId",
 *              "variant": "default"
 *          },
 *          {
 *              "type": "logo",
 *              "href": "/my-link",
 *              "target": "blank",
 *              "src": "/my-image.jpg",
 *              "style": {}
 *          },
 *          {
 *              "type": "button",
 *              "href": "/my-link",
 *              "target": "blank",
 *              "glyph": "heart",
 *              "iconType": "glyphicon",
 *              "tooltipId": "myMessageId",
 *              "variant": "default",
 *              "square": true
 *          },
 *          {
 *              "type": "divider"
 *          },
 *          {
 *              "type": "message",
 *              "labelId": "myTranslationMessageId"
 *          }
 *      ]
 *  }
 * }
 */
function Footer({
    menuItems: menuItemsProp,
    hideMenuItems,
    items,
    customFooter,
    customFooterMessageId
}, context) {
    const { loadedPlugins } = context;
    const ref = useRef();
    const configuredItems = usePluginItems({ items, loadedPlugins });
    const pluginMenuItems = configuredItems.filter(({ target }) => target === 'menu').map(item => ({ ...item, type: 'plugin' }));
    const menuItems = [
        ...menuItemsProp.map((menuItem, idx) => ({ ...menuItem, position: idx + 1 })),
        ...pluginMenuItems
    ].sort((a, b) => a.position - b.position);
    return (
        <>
            {customFooter ? <HTML msgId={customFooterMessageId} /> : null}
            {!hideMenuItems || menuItems.length === 0 ? <>
                <div style={{ height: ref?.current?.clientHeight }}></div>
                <FlexBox ref={ref} component="footer" id="ms-footer" className="ms-footer _padding-xs" centerChildren>
                    <Menu
                        centerChildrenVertically
                        gap="md"
                        alignRight
                        wrap
                        menuItemComponent={FooterMenuItem}
                        items={menuItems}
                    />
                </FlexBox>
            </> : false}
        </>
    );
}

Footer.propTypes = {
    menuItems: PropTypes.array,
    hideMenuItems: PropTypes.bool,
    items: PropTypes.array,
    customFooter: PropTypes.bool,
    customFooterMessageId: PropTypes.string
};

Footer.contextTypes = {
    loadedPlugins: PropTypes.object
};

Footer.defaultProps = {
    menuItems: [
        {
            type: 'link',
            href: "https://docs.mapstore.geosolutionsgroup.com/",
            target: 'blank',
            glyph: 'book',
            labelId: 'resourcesCatalog.documentation'
        },
        {
            type: 'link',
            href: 'https://github.com/geosolutions-it/MapStore2',
            target: 'blank',
            label: 'GitHub',
            glyph: 'github'
        }
    ],
    customFooter: false,
    customFooterMessageId: 'home.footerCustomHTML'
};


export default createPlugin('Footer', {
    component: withResizeDetector(Footer)
});
