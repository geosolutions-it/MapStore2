/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from '../../utils/PluginsUtils';
import Message from '../../components/I18N/Message';
import { setControlProperty, setControlProperties } from '../../actions/controls';
import ConnectedCatalog from './containers/Catalog';
import { Glyphicon } from 'react-bootstrap';
import { burgerMenuSelector } from '../../selectors/controls';
import API from '../../api/catalog';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { addBackground } from '../../actions/backgroundselector';


const AddLayerButton = connect(() => ({}), {
    onClick: setControlProperties.bind(null, 'metadataexplorer', 'enabled', true, 'group')
})(({
    onClick,
    selectedNodes,
    status,
    itemComponent,
    statusTypes,
    config,
    ...props
}) => {
    const ItemComponent = itemComponent;

    // deprecated TOC configuration
    if (config.activateAddLayerButton === false) {
        return null;
    }

    if ([statusTypes.DESELECT, statusTypes.GROUP].includes(status)) {
        const group = selectedNodes?.[0]?.id;
        return (
            <ItemComponent
                {...props}
                glyph="add-layer"
                tooltipId={status === statusTypes.GROUP ? 'toc.addLayerToGroup' : 'toc.addLayer'}
                onClick={() => onClick(group)}
            />
        );
    }
    return null;
});


export const BackgroundSelectorAdd = connect(
    createStructuredSelector({
        enabled: state => state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled
    }),
    {
        onAdd: addBackground
    }
)(({ source, onAdd = () => {}, itemComponent, canEdit, enabled }) => {
    const ItemComponent = itemComponent;
    return canEdit ? (
        <ItemComponent
            disabled={!!enabled}
            onClick={() => {
                onAdd(source || 'backgroundSelector');
            }}
            tooltipId="backgroundSelector.addTooltip"
            glyph="plus"
        />
    ) : null;
});


export default createPlugin('Catalog', {
    component: ConnectedCatalog,
    containers: {
        BurgerMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title"/>,
            tooltip: "catalog.tooltip",
            icon: <Glyphicon glyph="folder-open"/>,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            doNotHide: true,
            priority: 1
        },
        SidebarMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title" />,
            tooltip: "catalog.tooltip",
            icon: <Glyphicon glyph="folder-open" />,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            selector: (state) => ({
                style: {
                    display: burgerMenuSelector(state) ? 'none' : null
                }
            }),
            toggle: true,
            priority: 1,
            doNotHide: true
        },
        BackgroundSelector: {
            name: 'MetadataExplorer',
            doNotHide: true,
            priority: 1,
            Component: BackgroundSelectorAdd,
            target: 'background-toolbar'
        },
        TOC: {
            name: 'MetadataExplorer',
            doNotHide: true,
            priority: 1,
            target: 'toolbar',
            Component: AddLayerButton,
            position: 2
        }
    },
    reducers: { catalog: require('../../reducers/catalog').default },
    epics: require('../../epics/catalog').default(API)
});

/**
 * @memberof plugins
 * @name Catalog
 */
