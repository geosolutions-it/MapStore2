/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { get } from 'lodash';
import BorderLayout from '../components/layout/BorderLayout';
import Story from '../components/geostory/Story';

const update = () => console.log("TODO");

const onUpdate = ({ page, pages, currentSlide }) => update({ page, pages, currentSlide });
const onEdit = (data) => {
    const { sectionId, contentId, key, value, position = 'foreground' } = data;
    const sections = sections.map(section => {
        if (section.id === sectionId) {
            const contents = (section.contents || [])
                .map((content) => {
                    if (content.id === contentId) {
                        const newProperties = key ? { [key]: value } : value;
                        return {
                            ...(content || {}),
                            [position]: {
                                ...(content[position] || {}),
                                ...newProperties
                            }
                        };
                    }
                    return content;
                });
            return {
                ...section,
                contents
            };
        }
        return section;
    });
    update({
        sections: sections.map(section => ({ ...section, _needsUpdate: (section._needsUpdate || 0) + 1 }))
    });
};
const onAdd = (data) => {
    const sections = sections.reduce((newSections, section) => {
        if (section.id === data.id) {
            if (data.section) {
                return [
                    ...newSections,
                    section,
                    data.section
                ];
            }
            if (data.content) {
                return [
                    ...newSections,
                    {
                        ...section,
                        contents: [
                            ...section.contents,
                            data.content
                        ]
                    }
                ];
            }
        }
        return [
            ...newSections,
            section
        ];
    }, []);
    update({
        sections: sections.map(section => ({ ...section, _needsUpdate: (section._needsUpdate || 0) + 1 }))
    });
};
const GeoStory = ({
    storyType,
    sections = [],
    mode = 'view' // edit/view mode
}) => (<BorderLayout
        className="ms-geostory">
        <Story
            type={storyType}
            sections={sections}
            mode={mode}
            slidePosition={slidePosition}
            onUpdate={onUpdate}
            onEdit={onEdit}
            onAdd={onAdd} />
    </BorderLayout>
);
export const GeoStoryPlugin = connect(
    createSelector(
        [
            state => get(state, 'controls.geostory.layout'),
            state => get(state, 'controls.geostory.readOnly')
        ],
        (layoutType, readOnly) => ({
            layoutType,
            readOnly
        })
    )
)(GeoStory);
