/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
const GEOSTORY_SOURCE_ID = "geostory";

import {
    availableSourcesSelector,
    currentResourcesSelector,
    editingSelector,
    currentMediaTypeSelector,
    getSourceByIdSelectorCreator,
    mediaTypesSelector,
    openSelector,
    resultDataSelector,
    saveStateSelector,
    selectedIdSelector,
    selectedItemSelector,
    sourceIdSelector,
    sourcesSelector,
    sourcesForMediaTypeSelector,
    selectedSourceSelector
} from "../mediaEditor";

describe('mediaEditor selectors', () => {
    it('currentResourcesSelector', () => { expect(currentResourcesSelector({mediaEditor: {settings: {mediaType: "image", sourceId: "id"}, data: {image: {id: {resultData: {resources: []}}}}}})).toEqual([]); });
    it('editingSelector', () => { expect(editingSelector({mediaEditor: {saveState: {editing: true}}})).toEqual(true); });
    it('openSelector', () => { expect(openSelector({mediaEditor: {open: true}})).toEqual(true); });
    it('currentMediaTypeSelector', () => { expect(currentMediaTypeSelector({mediaEditor: {settings: {mediaType: "image"}}})).toEqual("image"); });
    it('sourceIdSelector', () => { expect(sourceIdSelector({mediaEditor: {settings: {sourceId: "id"}}})).toEqual("id"); });
    it('mediaTypesSelector', () => {
        expect(mediaTypesSelector({
            mediaEditor: {
                settings: {
                    mediaTypes: {
                        image: {
                            defaultSource: GEOSTORY_SOURCE_ID,
                            sources: [GEOSTORY_SOURCE_ID, "geostoreImage"]
                        }
                    }
                }
            }
        })).toEqual({image: {
            defaultSource: GEOSTORY_SOURCE_ID,
            sources: [GEOSTORY_SOURCE_ID, "geostoreImage"]
        }});
    });
    it('sourcesSelector', () => {
        expect(sourcesSelector({
            mediaEditor: {
                settings: {
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual({geostory: {
            name: "Current story",
            type: GEOSTORY_SOURCE_ID
        }});
    });
    it('sourcesForMediaTypeSelector', () => {
        expect(sourcesForMediaTypeSelector({
            mediaEditor: {
                settings: {
                    mediaType: "image",
                    mediaTypes: {
                        image: {
                            defaultSource: GEOSTORY_SOURCE_ID,
                            sources: [GEOSTORY_SOURCE_ID, "geostoreImage"]
                        }
                    },
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual([GEOSTORY_SOURCE_ID, "geostoreImage"]);
    });
    it('selectedSourceSelector', () => {
        expect(selectedSourceSelector({
            mediaEditor: {
                settings: {
                    sourceId: GEOSTORY_SOURCE_ID,
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual({
            name: "Current story",
            type: GEOSTORY_SOURCE_ID
        });
    });
    it('getSourceByIdSelectorCreator', () => {
        expect(getSourceByIdSelectorCreator(GEOSTORY_SOURCE_ID)({
            mediaEditor: {
                settings: {
                    sourceId: GEOSTORY_SOURCE_ID,
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual({
            name: "Current story",
            type: GEOSTORY_SOURCE_ID
        });
    });
    it('availableSourcesSelector', () => {
        expect(availableSourcesSelector({
            mediaEditor: {
                settings: {
                    mediaType: "image",
                    mediaTypes: {
                        image: {
                            defaultSource: GEOSTORY_SOURCE_ID,
                            sources: [GEOSTORY_SOURCE_ID, "geostoreImage"]
                        }
                    },
                    sourceId: GEOSTORY_SOURCE_ID,
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        },
                        geostoreImage: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual([{
            name: "Current story",
            id: GEOSTORY_SOURCE_ID
        },
        {
            name: "Current story",
            id: "geostoreImage"
        }]);
    });
    it('resultDataSelector', () => { expect(resultDataSelector({mediaEditor: {settings: {mediaType: "image", sourceId: "id"}, data: {image: {id: {resultData: {}}}}}})).toEqual({}); });
    it('saveStateSelector', () => { expect(saveStateSelector({mediaEditor: {saveState: "loading"}})).toEqual("loading"); });
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
