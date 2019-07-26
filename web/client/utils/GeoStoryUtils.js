/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { values } from "lodash";

// Allowed StoryTypes
export const StoryTypes = {
    CASCADE: 'cascade'
};
// Allowed types
export const SectionTypes = {
    TITLE: 'title',
    PARAGRAPH: 'paragraph',
    IMMERSIVE: 'immersive'
};
// Allowed contents
export const ContentTypes = {
    TEXT: 'text',
    MEDIA: 'media',
    COLUMN: 'column' // can have contents of type 'text' or 'media'
};
export const MediaTypes = {
    IMAGE: 'image',
    VIDEO: 'video'
};
export const Modes = {
    EDIT: 'edit',
    VIEW: 'view'
};
export const lists = {
    StoryTypes: values(StoryTypes),
    SectionTypes: values(SectionTypes),
    Modes: values(Modes)
};
