/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { withHandlers } from 'recompose';
import { WIDGETS_MAPS_REGEX } from "../../../../actions/widgets";

/**
 * Adapter that transforms toggleConnection callback arguments into the toggleConnection action arguments
 *
 * @param {object} mappings argument for the toggleConnection options
 */
export default (mappings) => withHandlers({
    toggleConnection: ({ toggleConnection = () => { }, editorData = {}}) =>
        (available = [], widgets = []) => {
            const availableDeps = available.filter(deps => {
                const [, widgetId, mapId] = WIDGETS_MAPS_REGEX.exec(deps) || [];
                if (widgetId && mapId) {
                    return widgets.some(w=> w.id === widgetId && w.selectedMapId === mapId);
                }
                return deps;
            });
            return toggleConnection(!editorData.mapSync, availableDeps, {
                dependenciesMap: editorData.dependenciesMap,
                mappings,
                sourceWidgetType: editorData.widgetType
            });
        }
});
