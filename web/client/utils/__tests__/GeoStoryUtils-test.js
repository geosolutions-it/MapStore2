/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from"expect";
import React from 'react';
import ReactDOM from 'react-dom';

import { values, isArray } from "lodash";
import uuid from 'uuid';

import {
    scrollToContent,
    getClassNameFromProps,
    StoryTypes,
    SectionTypes,
    SectionTemplates,
    ContentTypes,
    MediaTypes,
    Modes,
    isMediaSection,
    localizeElement,
    lists,
    getDefaultSectionTemplate
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
        expect(classes).toBe(" ms-bright ms-align-center ms-size-full");

        classes = getClassNameFromProps({
            theme: "dark",
            align: "left",
            size: "medium"
        }); // with custom params
        expect(classes).toBe(" ms-dark ms-align-left ms-size-medium");
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
            IMMERSIVE: "immersive"
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
            MEDIA: "template-media"
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
    it("test localizeElement", () => {
        expect(localizeElement(
            {
                title: "geostory.builder.title",
                size: "large"
            },
            {geostory: {builder: {title: "localized title"}}})
        ).toEqual({
            title: "localized title"
        });

        expect(localizeElement(
            {
                title: "geostory.builder.title",
                contents: [{
                    align: "left",
                    html: "geostory.builder.html"
                },
                {
                    align: "right",
                    html: "geostory.builder.html"
                }]
            },
            {
                geostory: {builder: {title: "localized title", html: "Html localized"}}
            }
        )).toEqual({
            title: "localized title",
            contents: [{
                align: "left",
                html: "Html localized"
            }, {
                align: "right",
                html: "Html localized"
            }]
        });

    });
    describe("getDefaultSectionTemplate", () => {
        it("default", () => {
            const wrongType = "beda";
            const data = getDefaultSectionTemplate(wrongType);
            expect(data.id).toExist();
            expect(data.type).toBe(wrongType);
            expect(data.title).toBe("geostory.builder.defaults.titleUnknown");
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
            expect(content.html).toBe("geostory.builder.defaults.htmlTitle");
            expect(content.size).toBe("large");
            expect(content.align).toBe("center");
            expect(content.theme).toBe("bright");
            const background = data.contents[0].background;
            expect(background.theme).toBe("bright");
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
            expect(textContent.html).toBe("geostory.builder.defaults.htmlSample");
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
            expect(textContent.html).toBe("geostory.builder.defaults.htmlSample");
            expect(textContent.id).toExist();
            expect(textContent.id.length).toBe(uuid().length);
            expect(textContent.resourceId).toNotExist();
            const background = content.background;
            expect(background.type).toBe(undefined);
            expect(background.size).toBe("full");
            expect(background.fit).toBe("cover");
            expect(background.theme).toBe("bright");
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
            expect(mediaContent.size).toBe("medium");
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
            expect(content.html).toBe("geostory.builder.defaults.htmlSample");
            expect(content.type).toBe(ContentTypes.TEXT);
            const background = data.background;
            expect(background.type).toBe(undefined);
            expect(background.size).toBe("full");
            expect(background.fit).toBe("cover");
            expect(background.theme).toBe("bright");
            expect(background.align).toBe("center");
        });

        it("ContentTypes.TEXT", () => {
            const data = getDefaultSectionTemplate(ContentTypes.TEXT);
            expect(data.id).toExist();
            expect(data.type).toBe(ContentTypes.TEXT);
            expect(data.html).toBe("geostory.builder.defaults.htmlSample");
        });
    });
});
