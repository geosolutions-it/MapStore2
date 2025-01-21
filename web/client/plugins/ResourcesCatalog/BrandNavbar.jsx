/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from "../../utils/PluginsUtils";
import FlexBox from './components/FlexBox';
import Menu from './components/Menu';
import usePluginItems from '../../hooks/usePluginItems';
import Button from './components/Button';
import tooltip from '../../components/misc/enhancers/tooltip';
import Spinner from './components/Spinner';
import Icon from './components/Icon';
const ButtonWithTooltip = tooltip(Button);

function BrandNavbarMenuItem({
    className,
    loading,
    glyph,
    glyphType = 'glyphicon',
    labelId,
    onClick
}) {
    return (
        <ButtonWithTooltip
            square
            borderTransparent
            tooltipId={labelId}
            tooltipPosition="bottom"
            onClick={onClick}
            className={className}
        >
            {loading ? <Spinner /> : <Icon glyph={glyph} type={glyphType} />}
        </ButtonWithTooltip>
    );
}

function BrandNavbar({
    size,
    variant,
    leftMenuItems = [],
    rightMenuItems = [],
    items
}, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });
    const pluginLeftMenuItems = configuredItems.filter(({ target }) => target === 'left-menu').map(item => ({ ...item, type: 'plugin' }));
    const pluginRightMenuItems = configuredItems.filter(({ target }) => target === 'right-menu').map(item => ({ ...item, type: 'plugin' }));
    return (
        <>
            <FlexBox
                id="ms-brand-navbar"
                classNames={[
                    'ms-brand-navbar',
                    'ms-main-colors',
                    'shadow-md',
                    '_sticky',
                    '_corner-tl',
                    '_padding-lr-sm',
                    '_padding-tb-xs'
                ]}
                centerChildrenVertically
                gap="sm"
            >
                <FlexBox.Fill
                    component={Menu}
                    centerChildrenVertically
                    gap="xs"
                    size={size}
                    variant={variant}
                    items={[
                        ...leftMenuItems,
                        ...pluginLeftMenuItems
                    ]}
                />
                <Menu
                    centerChildrenVertically
                    gap="xs"
                    variant={variant}
                    alignRight
                    size={size}
                    menuItemComponent={BrandNavbarMenuItem}
                    items={[
                        ...rightMenuItems,
                        ...pluginRightMenuItems
                    ]}
                />
            </FlexBox>
        </>
    );
}


export default createPlugin('BrandNavbar', {
    component: BrandNavbar
});
