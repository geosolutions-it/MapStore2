/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import { create } from '../geostory';

describe('Test correctness of the geostory media api', () => {
    it('testing load stream', (done) => {
        const imgType = "image";
        const mapType = "map";
        const mediaType = 'image';
        const params = {
            page: 1,
            pageSize: 10
        };
        const imageResource = {
            "id": "3025f52e-8d57-48df-9a56-8e21ac252282",
            type: imgType,
            "data": {
                "src": "https://images.unsplash.com",
                "title": "title",
                "credits": "credits",
                "description": "desc",
                "altText": "altText"
            }
        };
        const store = {
            getState: () => ({
                geostory: {
                    currentStory: {
                        resources: [
                            imageResource,
                            {
                                "id": "8d578d57-8d57-48df-9a56-8e21ac252282",
                                type: mapType,
                                "data": {
                                    "title": "Map name",
                                    "description": "map desc",
                                    layers: [],
                                    "altText": "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
                                }
                            }
                        ]
                    }
                }
            })
        };
        const { load } = create({ store });
        const streams = load({ params, mediaType });
        expect(streams.value.resources).toEqual([imageResource]);
        expect(streams.value.totalCount).toBe(1);
        done();
    });
});
