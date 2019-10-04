/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import {load} from '../geostory';

describe('Test correctness of the geostory media api', () => {
    it('testing load stream', (done) => {
        const imgType = "image";
        const mapType = "map";
        const streams = load({getState: () => ({
            geostory: {
                currentStory: {
                    resources: [{
                        "id": "3025f52e-8d57-48df-9a56-8e21ac252282",
                        type: imgType,
                        "data": {
                            "src": "https://images.unsplash.com",
                            "title": "title",
                            "credits": "credits",
                            "description": "desc",
                            "altText": "altText"
                        }
                    },
                    {
                        "id": "8d578d57-8d57-48df-9a56-8e21ac252282",
                        type: mapType,
                        "data": {
                            "title": "Map name",
                            "description": "map desc",
                            layers: [],
                            "altText": "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
                        }
                    }]
                }
            }
        })
        });
        expect(streams.value.length).toBe(2);
        const result1 = streams.value[0];
        const result2 = streams.value[1];
        expect(result1.mediaType).toBe(imgType);
        expect(result2.mediaType).toBe(mapType);
        done();
    });
});
