/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    openSelector,
    saveStateSelector,
    mediaTypeSelector,
    sourceIdSelector,
    resultDataSelector,
    currentResourcesSelector,
    selectedIdSelector,
    selectedItemSelector
 } from "../mediaEditor";

describe('mediaEditor selectors', () => {
    it('openSelector', () => { expect(openSelector({mediaEditor: {open: true}})).toEqual(true); });
    it('saveStateSelector', () => { expect(saveStateSelector({mediaEditor: {saveState: "loading"}})).toEqual("loading"); });
    it('mediaTypeSelector', () => { expect(mediaTypeSelector({mediaEditor: {settings: {mediaType: "image"}}})).toEqual("image"); });
    it('sourceIdSelector', () => { expect(sourceIdSelector({mediaEditor: {settings: {sourceId: "id"}}})).toEqual("id"); });
    it('resultDataSelector', () => { expect(resultDataSelector({mediaEditor: {settings: {mediaType: "image", sourceId: "id"}, data: {image: {id: {resultData: {}}}}}})).toEqual({}); });
    it('currentResourcesSelector', () => { expect(currentResourcesSelector({mediaEditor: {settings: {mediaType: "image", sourceId: "id"}, data: {image: {id: {resultData: {resources: []}}}}}})).toEqual([]); });
    it('selectedIdSelector', () => { expect(selectedIdSelector({mediaEditor: {selected: "id"}})).toEqual("id"); });
    it('selectedItemSelector', () => {
        expect(selectedItemSelector({
            mediaEditor: {
                selected: "id",
                settings: {mediaType: "image", sourceId: "id"},
                data: {
                    image: {
                        id: {
                            resultData: {
                                resources: [{
                                    id: "id"
                                }]
                            }
                        }
                    }
                }
            }
        })).toEqual({id: "id"});
    });


});
