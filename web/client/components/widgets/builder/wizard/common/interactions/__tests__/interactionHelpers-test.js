/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { getInteractionTargetNodeDisabled } from '../interactionHelpers';

const sourceNodePath = 'widgets[filter-widget].filters[filter-1]';
const otherSourceNodePath = 'widgets[filter-widget].filters[filter-2]';

const applyDimensionTarget = {
    targetType: 'applyDimension'
};

const applyStyleTarget = {
    targetType: 'applyStyle'
};

const elementItem = {
    type: 'element'
};

const collectionItem = {
    type: 'collection'
};

describe('interactionHelpers', () => {
    describe('getInteractionTargetNodeDisabled', () => {
        it('should not disable collection nodes', () => {
            const result = getInteractionTargetNodeDisabled({
                item: collectionItem,
                target: applyDimensionTarget,
                targetNodePath: 'map',
                sourceNodePath
            });

            expect(result).toEqual({
                disabled: false,
                reasonMsgId: null
            });
        });

        it('should disable style targets already connected from another source', () => {
            const result = getInteractionTargetNodeDisabled({
                item: elementItem,
                target: applyStyleTarget,
                targetNodePath: 'map.layers[layer-1]',
                sourceNodePath,
                alreadyExistingInteractions: [{
                    plugged: true,
                    targetType: 'applyStyle',
                    source: {
                        nodePath: otherSourceNodePath
                    },
                    target: {
                        nodePath: 'map.layers[layer-1]'
                    }
                }]
            });

            expect(result).toEqual({
                disabled: true,
                reasonMsgId: 'widgets.filterWidget.targetAlreadyConnectedToAnotherFilterTooltip'
            });
        });

        it('should disable layer dimension targets already connected from another source', () => {
            const result = getInteractionTargetNodeDisabled({
                item: elementItem,
                target: applyDimensionTarget,
                targetNodePath: 'map.layers[layer-1].params.elevation',
                sourceNodePath,
                alreadyExistingInteractions: [{
                    plugged: true,
                    targetType: 'applyDimension',
                    source: {
                        nodePath: otherSourceNodePath
                    },
                    target: {
                        nodePath: 'map.layers[layer-1].params.elevation'
                    }
                }]
            });

            expect(result).toEqual({
                disabled: true,
                reasonMsgId: 'widgets.filterWidget.targetAlreadyConnectedToAnotherFilterTooltip'
            });
        });

        it('should disable unplugged apply dimension targets for multiple selection sources', () => {
            const result = getInteractionTargetNodeDisabled({
                item: elementItem,
                target: applyDimensionTarget,
                targetNodePath: 'map.layers[layer-1].params.elevation',
                sourceNodePath,
                plugged: false,
                sourceSelectionMode: 'multiple'
            });

            expect(result).toEqual({
                disabled: true,
                reasonMsgId: 'widgets.filterWidget.applyDimensionMultipleSelectionDisabledTooltip'
            });
        });

        it('should disable non-map-time targets when map time is already connected from the same source', () => {
            const result = getInteractionTargetNodeDisabled({
                item: elementItem,
                target: applyDimensionTarget,
                targetNodePath: 'map.layers[layer-1].params.elevation',
                sourceNodePath,
                alreadyExistingInteractions: [{
                    plugged: true,
                    targetType: 'applyDimension',
                    source: {
                        nodePath: sourceNodePath
                    },
                    target: {
                        nodePath: 'map.time'
                    }
                }]
            });

            expect(result).toEqual({
                disabled: true,
                reasonMsgId: 'widgets.filterWidget.targetAlreadyConnectedToTimeTooltip'
            });
        });
    });
});
