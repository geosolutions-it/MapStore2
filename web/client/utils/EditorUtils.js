/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ContentState, EditorState, convertToRaw, Entity } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

// customGetEntityId is a utility function used by html-to-draftjs library in order
// to create anhor tag chunks
export const customGetEntityId = (node) => {
    let entityId = undefined;
    if (
        node instanceof HTMLAnchorElement
    ) {
        const entityConfig = {};
        if (node.dataset && node.dataset.mention !== undefined) {
            entityConfig.url = node.href;
            entityConfig.text = node.innerHTML;
            entityConfig.value = node.dataset.value;
            entityId = Entity.__create(
                'MENTION',
                'IMMUTABLE',
                entityConfig,
            );
        } else {
            entityConfig.url = node.getAttribute ? node.getAttribute('href') || node.href : node.href;
            entityConfig.title = node.innerHTML;
            entityConfig.targetOption = node.target;
            const interactionType = node.getAttribute && node.getAttribute('data-geostory-interaction-type');
            const interactionParams = node.getAttribute && node.getAttribute('data-geostory-interaction-params');
            const interactionName = node.getAttribute && node.getAttribute('data-geostory-interaction-name');

            let attributes = {};

            if (interactionName && interactionParams && interactionType) {
                attributes['data-geostory-interaction-type'] = interactionType;
                attributes['data-geostory-interaction-params'] = interactionParams;
                attributes['data-geostory-interaction-name'] = interactionName;

            }

            entityConfig.attributes = attributes;
            entityId = Entity.__create(
                'LINK',
                'MUTABLE',
                entityConfig,
            );
        }
    }
    return entityId;
};

// customEntityTransform is a utility function used by draftjs-to-html inorder to create html from
// entities in draftjs
export const customEntityTransform = (entity, text) => {
    if (entity.type === 'MENTION') {
        return `< href="${entity.data.url}" class="wysiwyg-mention" data-mention data-value="${entity.data.value}">${text}</a>`;
    }

    if (entity.type === 'LINK') {
        const targetOption = entity.data.targetOption || '_self';
        const attributes = entity.data.attributes;

        if (attributes && attributes['data-geostory-interaction-type']) {
            return `<a data-geostory-interaction-name="${attributes['data-geostory-interaction-name']}" data-geostory-interaction-type="${attributes['data-geostory-interaction-type']}" data-geostory-interaction-params="${attributes['data-geostory-interaction-params']}" onclick="__geostory_interaction(type='scrollTo', '${attributes['data-geostory-interaction-params']}')">${text}</a>`;
        }
        return `<a href="${entity.data.url}" target="${targetOption}">${text}</a>`;
    }

    if (entity.type === 'IMAGE') {
        const alignment = entity.data.alignment;

        if (alignment && alignment.length) {
            return `<div style="text-align:'${alignment};'"><img src="${entity.data.src}" alt="${entity.data.alt}" style="height:'${entity.data.height}', width: '${entity.data.width}'" /></div>`;
        }

        return `<img src="${entity.data.src}" alt="${entity.data.alt}" style="height:'${entity.data.height}', width: '${entity.data.width}'" />`;
    }

    if (entity.type === 'EMBEDDED_LINK') {
        return `<iframe width="${entity.data.width}" height="${entity.data.height}" src="${entity.data.src}" frameBorder="0"></iframe>`;
    }
    return text;
};


export const htmlToDraftJSEditorState = (html = '') => {
    const contentBlock = htmlToDraft(html, null, customGetEntityId);
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);

    return EditorState.createWithContent(contentState);
};

export const draftJSEditorStateToHtml = (editorState, emptyPlaceholder = '') => {
    if (editorState) {
        const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
        // it can happen that first block is empty, i.e. there is a carriage return
        const rawText = blocks.length === 1 ? convertToRaw(editorState.getCurrentContent()).blocks[0].text : true;
        const html = draftToHtml(convertToRaw(editorState.getCurrentContent()), null, null, customEntityTransform);

        return rawText ? html : emptyPlaceholder;
    }

    return emptyPlaceholder;
};
