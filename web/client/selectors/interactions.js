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

/**
 * Get all interactions from state
 */
export const getConnectedInteractions = (state) => state.interactions?.connectedInteractions || [];

/**
 * Get interactions matching an event payload
 * @param {object} state - Redux state
 * @param {object} eventPayload - Event payload with sourceNodePath and eventType
 */
export const getInteractionsForEvent = createSelector(
    [getConnectedInteractions, (state, eventPayload) => eventPayload],
    (interactions, eventPayload) => {
        if (!eventPayload) return [];
        return interactions.filter(interaction => {
            // Check if interaction is enabled
            if (!interaction.enabled) {
                return false;
            }

            // Match by source node path
            if (interaction.source.nodePath !== eventPayload.sourceNodePath) {
                return false;
            }

            // Match by event type
            if (interaction.source.eventType !== eventPayload.eventType) {
                return false;
            }

            return true;
        });
    }
);

/**
 * Check if a specific interaction is active
 * @param {object} state - Redux state
 * @param {string} sourceNodePath - Source node path
 * @param {string} targetNodePath - Target node path
 * @param {string} eventType - Event type
 */
export const isInteractionActive = createSelector(
    [getConnectedInteractions, (state, sourceNodePath, targetNodePath, eventType) => ({ sourceNodePath, targetNodePath, eventType })],
    (interactions, { sourceNodePath, targetNodePath, eventType }) => {
        return interactions.some(interaction =>
            interaction.enabled &&
            interaction.source.nodePath === sourceNodePath &&
            interaction.source.eventType === eventType &&
            interaction.target.nodePath === targetNodePath
        );
    }
);

/**
 * Get all interactions for a source node path
 * @param {object} state - Redux state
 * @param {string} sourceNodePath - Source node path
 */
export const getInteractionsForSource = createSelector(
    [getConnectedInteractions, (state, sourceNodePath) => sourceNodePath],
    (interactions, sourceNodePath) => {
        if (!sourceNodePath) return [];
        return interactions.filter(interaction =>
            interaction.enabled &&
            interaction.source.nodePath === sourceNodePath
        );
    }
);


