/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {Glyphicon, Button} from 'react-bootstrap';
import {Controlled as Codemirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

import Transfer from '../misc/Transfer';

const pluginsToItems = (plugins, editedPlugin, editedCfg, onEditPlugin, onUpdateCfg, changePluginsKey,
    processChildren, isRoot, rootIsEnabled) =>
    plugins && plugins.map(plugin => {
        const enableTools = (isRoot || rootIsEnabled) && plugin.enabled;
        return {
            id: plugin.name,
            title: plugin.label || plugin.name,
            description: 'plugin name: ' + plugin.name,
            className: !isRoot && rootIsEnabled && !plugin.enabled ? 'plugin-card-disabled' : '',
            tools: enableTools ? [{
                glyph: '1-user-mod',
                tooltipId: plugin.isUserPlugin ?
                    'contextCreator.configurePlugins.tooltips.disableUserPlugin' :
                    'contextCreator.configurePlugins.tooltips.enableUserPlugin',
                bsStyle: plugin.isUserPlugin ? 'success' : undefined,
                onClick: () => changePluginsKey([plugin.name], 'isUserPlugin', !plugin.isUserPlugin)
            }, {
                visible: plugin.isUserPlugin,
                glyph: plugin.active ? 'check' : 'unchecked',
                tooltipId: plugin.active ?
                    'contextCreator.configurePlugins.tooltips.deactivatePlugin' :
                    'contextCreator.configurePlugins.tooltips.activatePlugin',
                onClick: () => changePluginsKey([plugin.name], 'active', !plugin.active)
            }, {
                glyph: 'wrench',
                tooltipId: 'contextCreator.configurePlugins.tooltips.editConfiguration',
                active: plugin.name === editedPlugin,
                onClick: () => onEditPlugin(plugin.name === editedPlugin ? undefined : plugin.name)
            }] : [],
            component: enableTools && plugin.name === editedPlugin ?
                <Codemirror
                    value={editedCfg}
                    onBeforeChange={(editor, data, cfg) => onUpdateCfg(cfg)}
                    options={{
                        theme: 'lesser-dark',
                        mode: 'application/json',
                        lineNumbers: true,
                        styleSelectedText: true,
                        indentUnit: 2,
                        tabSize: 2
                    }}/> : null,
            preview: !isRoot && rootIsEnabled &&
                <Button
                    className="square-button-md no-border"
                    onClick={(event) => {
                        event.stopPropagation();
                        changePluginsKey([plugin.name], 'enabled', !plugin.enabled);
                    }}>
                    <Glyphicon glyph={plugin.enabled ? 'check' : 'unchecked'}/>
                </Button> || null,
            children: processChildren &&
                pluginsToItems(plugin.children, editedPlugin, editedCfg, onEditPlugin, onUpdateCfg, changePluginsKey,
                    true, false, isRoot && plugin.enabled) || []
        };
    });

const pickIds = items => items && items.map(item => item.id);

export default ({
    allPlugins = [],
    editedPlugin,
    editedCfg,
    availablePluginsFilterText = "",
    enabledPluginsFilterText = "",
    availablePluginsFilterPlaceholder = "contextCreator.configurePlugins.pluginsFilterPlaceholder",
    enabledPluginsFilterPlaceholder = "contextCreator.configurePlugins.pluginsFilterPlaceholder",
    onFilterAvailablePlugins = () => {},
    onFilterEnabledPlugins = () => {},
    onEditPlugin = () => {},
    onUpdateCfg = () => {},
    setSelectedPlugins = () => {},
    changePluginsKey = () => {}
}) => {
    const selectedPlugins = allPlugins.filter(plugin => plugin.selected);
    const availablePlugins = allPlugins.filter(plugin => !plugin.enabled);
    const enabledPlugins = allPlugins.filter(plugin => plugin.enabled);
    const selectedItems = pluginsToItems(selectedPlugins, editedPlugin, editedCfg, onEditPlugin, onUpdateCfg,
        changePluginsKey, false, true);
    const availableItems = pluginsToItems(availablePlugins, editedPlugin, editedCfg, onEditPlugin, onUpdateCfg,
        changePluginsKey, true, true);
    const enabledItems = pluginsToItems(enabledPlugins, editedPlugin, editedCfg, onEditPlugin, onUpdateCfg,
        changePluginsKey, true, true);

    return (
        <div className="configure-plugins-step">
            <Transfer
                leftColumn={{
                    items: availableItems,
                    title: 'contextCreator.configurePlugins.availablePlugins',
                    filterText: availablePluginsFilterText,
                    filterPlaceholder: availablePluginsFilterPlaceholder,
                    emptyStateProps: {
                        glyph: 'wrench',
                        title: 'contextCreator.configurePlugins.availablePluginsEmpty'
                    },
                    emptyStateSearchProps: {
                        glyph: 'info-sign',
                        title: 'contextCreator.configurePlugins.searchResultsEmpty'
                    },
                    onFilter: onFilterAvailablePlugins
                }}
                rightColumn={{
                    items: enabledItems,
                    title: 'contextCreator.configurePlugins.enabledPlugins',
                    filterText: enabledPluginsFilterText,
                    filterPlaceholder: enabledPluginsFilterPlaceholder,
                    emptyStateProps: {
                        glyph: 'wrench',
                        title: 'contextCreator.configurePlugins.enabledPluginsEmpty'
                    },
                    emptyStateSearchProps: {
                        glyph: 'info-sign',
                        title: 'contextCreator.configurePlugins.searchResultsEmpty'
                    },
                    onFilter: onFilterEnabledPlugins
                }}
                allowCtrlMultiSelect
                selectedItems={selectedItems}
                selectedSide={allPlugins.reduce((result, plugin) => plugin.selected && plugin.enabled || result, false) ?
                    'right' :
                    'left'
                }
                sortStrategy={items => items && items.sort((x, y) => x.title > y.title)}
                filter={(text, items) => {
                    const loweredText = text.toLowerCase();
                    return items.filter(item => item.title.toLowerCase().indexOf(loweredText) > -1);
                }}
                onSelect={items => setSelectedPlugins(pickIds(items))}
                onTransfer={(items, direction) => changePluginsKey(pickIds(items), 'enabled', direction === 'right')}/>
        </div>
    );
};
