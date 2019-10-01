/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';


import BorderLayout from '../../layout/BorderLayout';
import SectionsPreview from './SectionsPreview';

import Toolbar from '../../misc/toolbar/Toolbar';
import { lists, Modes } from'../../../utils/GeoStoryUtils';

/**
 * Base Component that shows basic editing tools and SlidesPreview
 * of a geo-story.
 * @param {object} [story] the current story editing
 * @param {string} [mode='view'] can be 'edit' or 'view'
 * @param {function} [setEditing] handler for setEditing button in toolbar
 */
class Builder extends React.Component {

    static propTypes = {
        story: PropTypes.object,
        mode: PropTypes.oneOf(lists.Modes),
        onToggleCardPreview: PropTypes.func,
        cardSelected: PropTypes.string,
        cardPreviewEnabled: PropTypes.bool,
        scrollTo: PropTypes.func,
        setEditing: PropTypes.func
    };

    static defaultProps = {
        mode: Modes.VIEW,
        cardSelected: "",
        setEditing: () => {},
        onToggleCardPreview: () => {},
        story: {},
        cardPreviewEnabled: true
    };

    render() {
        const {
            cardSelected,
            story,
            scrollTo,
            setEditing,
            mode,
            cardPreviewEnabled,
            onToggleCardPreview
        } = this.props;
        return (<BorderLayout
                className="ms-geostory-builder"
                header={
                    <div
                        className="text-center ms-geostory-builder-header"
                        >
                        <Toolbar
                            btnDefaultProps={{
                                className: "square-button-md",
                                bsStyle: "primary"
                            }}
                            buttons={[
                                {
                                    tooltipId: "geostory.builder.delete",
                                    glyph: "trash",
                                    disabled: !cardSelected
                                },
                                {
                                    tooltipId: "geostory.builder.preview",
                                    glyph: "eye-open",
                                    onClick: () => setEditing(mode === Modes.VIEW)
                                },
                                {
                                    tooltipId: "geostory.builder.settings.tooltip",
                                    glyph: "cog",
                                    disabled: true // TODO: restore when implemented
                                },
                                {
                                    tooltipId: `geostory.builder.${cardPreviewEnabled ? "hide" : "show"}`,
                                    glyph: "list-alt",
                                    bsStyle: cardPreviewEnabled ? "success" : "primary",
                                    onClick: () => onToggleCardPreview()
                                }
                            ]}/>
                    </div>
                }>
            <SectionsPreview
                scrollTo={scrollTo}
                cardPreviewEnabled={cardPreviewEnabled}
                sections={story && story.sections}
                />
            </BorderLayout>
        );
    }
}

export default Builder;
