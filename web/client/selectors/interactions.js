import {createSelector} from 'reselect';
import {currentPluginsSelector, pluginsSelector} from '../selectors/context';
import { isString } from 'lodash';
import { layersSelector } from './layers';
import { mapSelector } from './map';
import { getFloatingWidgets, getFloatingWidgetsPerView } from './widgets';
import { generateInteractionMetadataTree, generateMapMetadataTree, generateWidgetsMetadataTree } from '../utils/InteractionUtils';

const supportsInteractions = pluginName => {
    return pluginName === 'Map' || pluginName === 'Widgets';
};
export const interactionsSupportedPluginsSelector = createSelector(
    pluginsSelector,
    (plugins) => {
        return plugins ? plugins.desktop.map(p => isString(p) ? p : p.name).filter(supportsInteractions) : []
    });
/*
 * We have to memoize the interactions metadata tree generation
 * to avoid re-generating the tree on each state change.
 * For this reason we use `reselect` to create a memoized selector.
 * We need:
 * - the current plugins list that we know generates interactions (map plugin, widgets plugin, etc)
 * - for each of these plugins we need the relevant state slice (map state, widgets state, etc)
 * - (future custom plugins or widgets may require other slices)
 * - the widgets registry to generate the widgets metadata tree
 */
export const generateInteractionMetadataTreeSelector = createSelector(
    interactionsSupportedPluginsSelector,
    mapSelector,
    layersSelector,
    getFloatingWidgets,
    (plugins, mapState, layers, widgets) => {
        return generateInteractionMetadataTree(plugins, widgets, mapState, layers);
    }
);


