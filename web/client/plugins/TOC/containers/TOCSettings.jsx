/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import { updateTOCConfig } from '../actions/toc';

/**
 * This component provides the toc settings actions to make them available inside the toolbar or context menu.
 * Available actions:
 * - initial state of the panel: close or open
 * - switch between legend and default theme
 * - show or hide full title
 * - show or hide the opacity slider
 * - show or hide the opacity slider tooltip
 */
const TOCSettings = connect(
    () => ({}),
    {
        onUpdateTOCConfig: updateTOCConfig
    }
)(({
    itemComponent,
    selectedNodes,
    rootGroupId,
    onUpdateTOCConfig,
    config,
    ...props
}) => {

    const ItemComponent = itemComponent;
    const selected = selectedNodes?.[0];
    if (selected?.id === rootGroupId || props?.menuItem) {
        return (
            <>
                <ItemComponent
                    {...props}
                    labelId={config.defaultOpen ? 'toc.closeOnMapInitialization' : 'toc.openOnMapInitialization'}
                    glyph={config.defaultOpen ? 'arrow-left' : 'arrow-right'}
                    onClick={() => {
                        onUpdateTOCConfig({
                            defaultOpen: !config.defaultOpen
                        });
                    }}
                />
                <ItemComponent
                    {...props}
                    labelId={ config?.theme ? 'toc.defaultTheme' : 'toc.legendTheme'}
                    glyph="list"
                    onClick={() => {
                        onUpdateTOCConfig({
                            theme: !config?.theme ? 'legend' : undefined
                        });
                    }}
                />
                <ItemComponent
                    {...props}
                    labelId={ config?.showFullTitle ? 'toc.hideFullTitle' : 'toc.showFullTitle'}
                    glyph="font"
                    onClick={() => {
                        onUpdateTOCConfig({
                            showFullTitle: !config?.showFullTitle
                        });
                    }}
                />
                <ItemComponent
                    {...props}
                    labelId={config?.hideOpacitySlider ? 'toc.showOpacitySlider' : 'toc.hideOpacitySlider'}
                    glyph="adjust"
                    onClick={() => {
                        onUpdateTOCConfig({
                            hideOpacitySlider: !config?.hideOpacitySlider
                        });
                    }}
                />
                {!config?.hideOpacitySlider && <ItemComponent
                    {...props}
                    labelId={!config?.showOpacityTooltip ? 'toc.showOpacityTooltip' : 'toc.hideOpacityTooltip'}
                    glyph="tag"
                    onClick={() => {
                        onUpdateTOCConfig({
                            showOpacityTooltip: !config?.showOpacityTooltip
                        });
                    }}
                />}
                <hr/>
            </>
        );
    }
    return null;
});

export default TOCSettings;

