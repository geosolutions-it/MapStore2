/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from "expect";
import {
    availableSnappingLayers,
    changedGeometriesSelector,
    drawSupportActiveSelector,
    isSnappingActive,
    isSnappingLoading,
    snappingConfig, snappingLayerSelector
} from "../draw";


describe('draw changedGeometriesSelector', () => {
    it('test changedGeometriesSelector selector', () => {
        const sampleFeatures = [];
        expect(changedGeometriesSelector({
            draw: {
                tempFeatures: sampleFeatures
            }
        })).toBe(sampleFeatures);
    });
    it('test drawSupportActiveSelector selector', () => {
        expect(drawSupportActiveSelector({
            draw: {
                drawStatus: 'replace'
            }
        })).toBe(true);
    });
    it('test snappingLayerSelector selector', () => {
        expect(snappingLayerSelector({
            layers: {
                flat: [
                    { id: 'layer001', type: 'wms' }
                ]
            },
            draw: {
                snappingLayer: 'layer001'
            }
        }).id).toBe('layer001');
    });
    it('test isSnappingActive selector', () => {
        expect(isSnappingActive({
            draw: {
                snapping: true
            }
        })).toBe(true);
    });
    it('test isSnappingLoading selector', () => {
        expect(isSnappingLoading({
            draw: {
                snappingIsLoading: true
            }
        })).toBe(true);
    });
    it('test snappingConfig selector', () => {
        const value = snappingConfig({
            draw: {
                snapConfig: {
                    a: true,
                    b: false
                }
            }
        });
        expect(value.a).toBe(true);
        expect(value.b).toBe(false);
    });
    it('test availableSnappingLayers selector', () => {
        const value = availableSnappingLayers({
            layers: [
                { id: 'layer001', type: 'wms', title: '001', visibility: true, search: { type: 'wfs' } }
            ],
            additionallayers: [
                { id: 'layer002', type: 'wfs', options: { id: 'layer002', title: '002', type: 'wfs', visibility: true } },
                { id: 'layer003', type: 'example', options: { id: 'layer003', title: '003', type: 'example', visibility: true } }
            ],
            draw: {
                snappingLayer: 'layer002',
                snapConfig: {
                    a: true,
                    b: false,
                    additionalLayers: [
                        'layer002'
                    ]
                }
            },
            featuregrid: {
                selectedLayer: 'layer001'
            }
        });
        expect(value[0].value).toBe('layer001');
        expect(value[0].active).toBe(false);
        expect(value[1].value).toBe('layer002');
        expect(value[1].active).toBe(true);
    });
});
