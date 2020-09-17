/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from "expect";
import { isArray, values } from "lodash";
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';

import {
    DEFAULT_MAP_OPTIONS,
    applyDefaults,
    createMapObject,
    ContentTypes,
    filterResources,
    MediaTypes,
    Modes,
    SectionTemplates,
    SectionTypes,
    StoryTypes,
    getClassNameFromProps,
    getDefaultSectionTemplate,
    isMediaSection,
    lists,
    scrollToContent,
    testRegex,
    isWebPageSection,
    getWebPageComponentHeight,
    parseHashUrlScrollUpdate,
    createWebFontLoaderConfig,
    extractFontNames
} from "../GeoStoryUtils";

describe("GeoStory Utils", () => {
    beforeEach( (done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = "";
        setTimeout(done);
    });
    it('test scrollToContent with image content', () => {
        const SAMPLE_ID = "res_img";
        const SAMPLE_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        ReactDOM.render(
            <div id="img-container">
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 0}
                    src={SAMPLE_SRC}
                />
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 1}
                    src={SAMPLE_SRC}
                />
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 2}
                    src={SAMPLE_SRC}
                />
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 3}
                    src={SAMPLE_SRC}
                />
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 4}
                    src={SAMPLE_SRC}
                />
            </div>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const images = container.querySelectorAll('img');
        expect(images).toExist();
        expect(images.length).toBe(5);
        expect(container.clientTop).toBe(0);
        scrollToContent(SAMPLE_ID + 4);
        expect(container.scrollHeight).toBeGreaterThan(0);
    });
    it('test getClassNameFromProps class creator', () => {
        let classes = getClassNameFromProps({}); // defaults
        expect(classes).toBe(" ms-align-center ms-size-full");

        classes = getClassNameFromProps({
            theme: "dark",
            align: "left",
            size: "medium"
        }); // with custom params
        expect(classes).toBe(" ms-dark ms-align-left ms-size-medium");
    });

    it('should not apply theme value if object', () => {
        const classes = getClassNameFromProps({
            theme: { backgroundColor: '#000000' },
            align: "left",
            size: "medium"
        }); // with custom params
        expect(classes).toBe(" ms-align-left ms-size-medium");
    });

    it("test StoryTypes", () => {
        expect(StoryTypes).toEqual({
            CASCADE: "cascade"
        });
    });
    it("test SectionTypes", () => {
        expect(SectionTypes).toEqual({
            TITLE: "title",
            PARAGRAPH: "paragraph",
            IMMERSIVE: "immersive",
            BANNER: 'banner'
        });
    });
    it("test isMediaSection", () => {
        expect(isMediaSection({
            "id": "1dc0bf18-9231-4d09-8f41-02df104b0f71",
            "type": "paragraph",
            "title": "Media Section",
            "contents": [
                {
                    "id": "85d354a1-6ffd-45c0-9b67-550d9a8f0022",
                    "type": "column",
                    "contents": [
                        {
                            "id": "84feac60-8f0f-4a93-9ec5-6452f261b490",
                            "type": "media"
                        }
                    ]
                }
            ]
        })).toBe(true);
    });
    it("test ContentTypes", () => {
        expect(ContentTypes).toEqual({
            TEXT: "text",
            MEDIA: "media",
            WEBPAGE: "webPage",
            COLUMN: "column"
        });
    });
    it("test MediaTypes", () => {
        expect(MediaTypes).toEqual({
            IMAGE: "image",
            MAP: "map",
            VIDEO: "video"
        });
    });
    it("test Modes", () => {
        expect(Modes).toEqual({
            EDIT: "edit",
            VIEW: "view"
        });
    });
    it("test SectionTemplates", () => {
        expect(SectionTemplates).toEqual({
            MEDIA: "template-media",
            WEBPAGE: "template-web-page"
        });
    });
    it("test lists", () => {
        expect(lists).toEqual({
            StoryTypes: values(StoryTypes),
            SectionTypes: values(SectionTypes),
            MediaTypes: values(MediaTypes),
            Modes: values(Modes)
        });
    });
    describe("getDefaultSectionTemplate", () => {
        it("default", () => {
            const wrongType = "beda";
            const data = getDefaultSectionTemplate(wrongType);
            expect(data.id).toExist();
            expect(data.type).toBe(wrongType);
            expect(data.title).toBe("geostory.builder.defaults.titleUnknown");
            expect(data.size).toBe("full");
            expect(data.align).toBe("center");
        });
        it("SectionTypes.TITLE", () => {
            const data = getDefaultSectionTemplate(SectionTypes.TITLE);
            expect(data.id).toExist();
            expect(data.id.length).toBe(uuid().length);
            expect(data.type).toBe(SectionTypes.TITLE);
            expect(data.title).toBe("geostory.builder.defaults.titleTitle");
            expect(data.cover).toBe(false);
            expect(isArray(data.contents)).toBe(true);
            const content = data.contents[0];
            expect(content.id).toExist();
            expect(content.id.length).toBe(uuid().length);
            expect(content.type).toBe(ContentTypes.TEXT);
            expect(content.size).toBe("large");
            expect(content.align).toBe("center");
            expect(content.theme).toBe("");
            const background = data.contents[0].background;
            expect(background.theme).toBe(undefined);
            expect(background.fit).toBe("cover");
            expect(background.size).toBe("full");
            expect(background.align).toBe("center");

        });
        it("SectionTypes.BANNER", () => {
            const data = getDefaultSectionTemplate(SectionTypes.BANNER);
            expect(data.id).toExist();
            expect(data.id.length).toBe(uuid().length);
            expect(data.type).toBe(SectionTypes.BANNER);
            expect(data.title).toBe("geostory.builder.defaults.titleBanner");
            expect(data.cover).toBe(false);
            expect(isArray(data.contents)).toBe(true);
            const content = data.contents[0];
            expect(content.id).toExist();
            expect(content.id.length).toBe(uuid().length);
            const background = data.contents[0].background;
            expect(background.theme).toBe(undefined);
            expect(background.fit).toBe("cover");
            expect(background.size).toBe("full");
            expect(background.align).toBe("center");
        });
        it("SectionTypes.PARAGRAPH", () => {
            const data = getDefaultSectionTemplate(SectionTypes.PARAGRAPH);
            expect(data.id).toExist();
            expect(data.type).toBe(SectionTypes.PARAGRAPH);
            expect(data.title).toBe("geostory.builder.defaults.titleParagraph");
            expect(isArray(data.contents)).toBe(true);
            const content = data.contents[0];
            expect(content.id).toExist();
            expect(content.id.length).toBe(uuid().length);
            expect(content.type).toBe(ContentTypes.COLUMN);
            expect(content.size).toBe("full");
            expect(content.align).toBe("center");
            const textContent = content.contents[0];
            expect(textContent.type).toBe(ContentTypes.TEXT);
            expect(textContent.id).toExist();
            expect(textContent.id.length).toBe(uuid().length);
            expect(textContent.resourceId).toNotExist();
        });
        it("SectionTypes.IMMERSIVE", () => {
            const data = getDefaultSectionTemplate(SectionTypes.IMMERSIVE);
            expect(data.id).toExist();
            expect(data.type).toBe(SectionTypes.IMMERSIVE);
            expect(data.title).toBe("geostory.builder.defaults.titleImmersive");
            expect(isArray(data.contents)).toBe(true);
            const content = data.contents[0];
            expect(content.id).toExist();
            expect(content.id.length).toBe(uuid().length);
            expect(content.type).toBe(ContentTypes.COLUMN);
            expect(content.size).toBe("small");
            expect(content.align).toBe("left");
            const textContent = content.contents[0];
            expect(textContent.type).toBe(ContentTypes.TEXT);
            expect(textContent.id).toExist();
            expect(textContent.id.length).toBe(uuid().length);
            expect(textContent.resourceId).toNotExist();
            const background = content.background;
            expect(background.type).toBe(undefined);
            expect(background.size).toBe("full");
            expect(background.fit).toBe("cover");
            expect(background.theme).toBe(undefined);
            expect(background.align).toBe("center");
        });
        it("SectionTemplates.MEDIA", () => {
            const data = getDefaultSectionTemplate(SectionTemplates.MEDIA);
            expect(data.id).toExist();
            expect(data.type).toBe(SectionTypes.PARAGRAPH);
            expect(data.title).toBe("geostory.builder.defaults.titleMedia");
            expect(isArray(data.contents)).toBe(true);
            const content = data.contents[0];
            expect(content.id).toExist();
            expect(content.id.length).toBe(uuid().length);
            expect(content.type).toBe(ContentTypes.COLUMN);
            const mediaContent = content.contents[0];
            expect(mediaContent.type).toBe(ContentTypes.MEDIA);
            expect(mediaContent.size).toBe("large");
            expect(mediaContent.align).toBe("center");
            expect(mediaContent.id.length).toBe(uuid().length);
            expect(mediaContent.resourceId).toNotExist();
        });
        it("ContentTypes.COLUMN", () => {
            const data = getDefaultSectionTemplate(ContentTypes.COLUMN);
            expect(data.id).toExist();
            expect(data.type).toBe(ContentTypes.COLUMN);
            expect(data.size).toBe("small");
            expect(data.align).toBe("left");
            expect(isArray(data.contents)).toBe(true);
            const content = data.contents[0];
            expect(content.id).toExist();
            expect(content.id.length).toBe(uuid().length);
            expect(content.type).toBe(ContentTypes.TEXT);
            const background = data.background;
            expect(background.type).toBe(undefined);
            expect(background.size).toBe("full");
            expect(background.fit).toBe("cover");
            expect(background.theme).toBe(undefined);
            expect(background.align).toBe("center");
        });

        it("ContentTypes.TEXT", () => {
            const data = getDefaultSectionTemplate(ContentTypes.TEXT);
            expect(data.id).toExist();
            expect(data.type).toBe(ContentTypes.TEXT);
        });
        it("ContentTypes.MEDIA", () => {
            const data = getDefaultSectionTemplate(ContentTypes.MEDIA);
            expect(data.id).toBeTruthy();
            expect(data.type).toBe(ContentTypes.MEDIA);
            expect(data.size).toBe('large');
            expect(data.align).toBe('center');
        });
    });
    it('test applyDefaults', () => {
        const res = applyDefaults();
        expect(res).toEqual(DEFAULT_MAP_OPTIONS);
    });
    it('test createMapObject', () => {
        const merged = {
            zoomControl: true,
            mapInfoControl: false,
            mapOptions: {
                scrollWheelZoom: false,
                interactions: {
                    mouseWheelZoom: false,
                    mouseClick: false,
                    dragPan: true
                }
            }
        };
        const res = createMapObject(DEFAULT_MAP_OPTIONS, {
            mapOptions: {
                interactions: {
                    mouseClick: false
                }
            }
        });
        expect(res).toEqual(merged);
    });
    it('test testRegex', () => {
        const title = "title";
        expect(testRegex(title, "it")).toBe(true);
        expect(testRegex(title, "aaa")).toBe(false);
    });
    it('test filterResources', () => {
        const resources = [{data: {title: "res1"}}, {data: {title: "res2"}}, {data: {title: "not matching title"}}];
        expect(filterResources(resources, "re").length).toBe(2);
        expect(filterResources(resources, "e").length).toBe(3);
    });
    it('test filterResources without title but name', () => {
        const resources = [{data: {name: "res1"}}, {data: {name: "res2"}}, {data: {title: "not matching title"}}];
        expect(filterResources(resources, "re").length).toBe(2);
        expect(filterResources(resources, "e").length).toBe(3);
    });
    it('test filterResources with title and description', () => {
        const resources = [{data: {title: "res1"}}, {data: {description: "res2"}}, {data: {title: "not matching title"}}];
        expect(filterResources(resources, "re").length).toBe(2);
        expect(filterResources(resources, "e").length).toBe(3);
    });
    it('test isWebPageSection', () => {
        const element = {
            type: SectionTypes.PARAGRAPH,
            contents: [
                {
                    contents: [
                        { type: ContentTypes.WEBPAGE }
                    ]
                }
            ]
        };
        expect(isWebPageSection(element)).toBe(true);
    });

    it('test isWebPageSection returns false if content has editURL set', () => {
        const element = {
            type: SectionTypes.PARAGRAPH,
            contents: [
                {
                    contents: [
                        { type: ContentTypes.WEBPAGE, editURL: false }
                    ]
                }
            ]
        };
        expect(isWebPageSection(element)).toBe(false);
        const element2 = { type: ContentTypes.WEBPAGE, editURL: false };
        expect(isWebPageSection(element2)).toBe(false);
    });

    it('test getWebPageComponentHeight', () => {
        expect(getWebPageComponentHeight('small', 1000)).toBe(400);
        expect(getWebPageComponentHeight('medium', 1000)).toBe(600);
        expect(getWebPageComponentHeight('large', 1000)).toBe(800);
        expect(getWebPageComponentHeight('full', 1000)).toBe(1000);
    });
    describe("parseHashUrlScrollUpdate", () => {
        it('initial without shared', () => {
            const url = 'host/#/geostory/111';
            const hash = '#/geostory/111';
            const storyId = 111;
            const sectionId = '222';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, sectionId)).toBe('host/#/geostory/111/section/222');
        });
        it('initial without shared with slash after storyId', () => {
            const url = 'host/#/geostory/111/';
            const hash = '#/geostory/111/';
            const storyId = 111;
            const sectionId = '222';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, sectionId)).toBe('host/#/geostory/111/section/222');
        });
        it('initial with shared', () => {
            const url = 'host/#/geostory/shared/111';
            const hash = '#/geostory/shared/111';
            const storyId = 111;
            const sectionId = '222';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, sectionId)).toBe('host/#/geostory/shared/111/section/222');
        });
        it('initial with shared with slash after storyId', () => {
            const url = 'host/#/geostory/shared/111/';
            const hash = '#/geostory/shared/111/';
            const storyId = 111;
            const sectionId = '222';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, sectionId)).toBe('host/#/geostory/shared/111/section/222');
        });
        it('only sectionId is changed without columnId provided', () => {
            const url = 'host/#/geostory/111/section/222';
            const hash = '#/geostory/111/section/222';
            const storyId = 111;
            const newSectionId = '333';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, newSectionId)).toBe('host/#/geostory/111/section/333');
        });
        it('changes to the new sectionId if previous sectionId and columnId are existed', () => {
            const url = 'host/#/geostory/111/section/222/column/333';
            const hash = '#/geostory/111/section/222/column/333';
            const storyId = 111;
            const newSectionId = '444';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, newSectionId)).toBe('host/#/geostory/111/section/444');
        });
        it('adds new columnId whithout previous columnId existed', () => {
            const url = 'host/#/geostory/111/section/222';
            const hash = '#/geostory/111/section/222';
            const storyId = 111;
            const newColumnId = '333';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, null, newColumnId)).toBe('host/#/geostory/111/section/222/column/333');
        });
        it('adds new columnId with previous columnId existed', () => {
            const url = 'host/#/geostory/111/section/222/column/333';
            const hash = '#/geostory/111/section/222/column/333';
            const storyId = 111;
            const newColumnId = '444';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, null, newColumnId)).toBe('host/#/geostory/111/section/222/column/444');
        });
        it('returns url if new columnId without sectionId existing with shared', () => {
            const url = 'host/#/geostory/shared/111/';
            const hash = '#/geostory/shared/111/';
            const storyId = 111;
            const newColumnId = '444';
            expect(parseHashUrlScrollUpdate(url, hash, storyId, null, newColumnId)).toBe(url);
        });
        it('returns null if no new sectionId or columnId', () => {
            const url = 'host/#/geostory/shared/111/';
            const hash = '#/geostory/shared/111/';
            const storyId = 111;
            expect(parseHashUrlScrollUpdate(url, hash, storyId, null, null)).toBe(null);
        });
    });

    it('returns a config for webfontloader', () => {
        const fontFamilyConf = [
            {
                family: "fam1",
                src: "link-fam1"
            },
            {
                family: "fam2",
                src: "link-fam2"
            },
            {
                family: "fam3",
                safe: true
            }
        ];

        const noop = () => {};

        expect(createWebFontLoaderConfig(fontFamilyConf, noop, noop)).toEqual({
            active: noop,
            inactive: noop,
            custom: {
                families: ["fam1", "fam2"],
                urls: ["link-fam1", "link-fam2"]
            }
        });
    });
    it('returns an array of font names', () => {
        const fontFamilies = [
            {
                family: "fam1",
                src: "link-fam1"
            },
            {
                family: "fam2",
                src: "link-fam2"
            }
        ];
        expect(extractFontNames(fontFamilies)).toEqual(["fam1", "fam2"]);
    });
});
