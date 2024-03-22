/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';

const SwipeButton = (props) => {
    const {
        swipeSettings,
        onSetActive,
        onSetSwipeMode,
        status,
        statusTypes,
        selectedNodes,
        itemComponent,
        swipeLayerId,
        onSetSwipeLayer = () => {}
    } = props;

    const ItemComponent = itemComponent;

    const showSwipeTools = (layerId, mode) => {
        onSetSwipeMode(mode);
        if ((!swipeSettings.active && (status === statusTypes?.LAYER))
        || (swipeSettings.active && swipeLayerId !== layerId)
        || (swipeSettings.active && swipeSettings?.mode !== mode)) {
            onSetSwipeLayer(layerId);
            return onSetActive(true);
        }
        onSetSwipeLayer();
        return onSetActive(false);
    };
    const layer = selectedNodes?.[0]?.node;
    if (![statusTypes?.LAYER].includes(status) || layer?.error) {
        return null;
    }

    const active = layer?.id === swipeLayerId;

    return (
        <>
            <ItemComponent
                {...props}
                active={active && swipeSettings?.mode === "swipe"}
                glyph="transfer"
                labelId="toc.swipe"
                onClick={() => showSwipeTools(layer?.id, "swipe")}
            />
            <ItemComponent
                {...props}
                active={active && swipeSettings?.mode === "spy"}
                glyph="search"
                labelId="toc.spyGlass"
                onClick={() => showSwipeTools(layer?.id, "spy")}
            />
        </>
    );
};

SwipeButton.propTypes = {
    swipeSettings: PropTypes.object,
    status: PropTypes.string,
    onSetActive: PropTypes.func,
    onSetSwipeMode: PropTypes.func
};

SwipeButton.defaultProps = {
    status: "LAYER",
    onSetSwipeMode: () => { },
    onSetActive: () => { }
};

export default SwipeButton;
