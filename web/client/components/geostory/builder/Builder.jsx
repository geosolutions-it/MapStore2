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
import emptyState from '../../misc/enhancers/emptyState';

import Toolbar from '../../misc/toolbar/Toolbar';
import { lists, Modes } from'../../../utils/GeoStoryUtils';
const Previews = emptyState(
    ({ sections = [] }) => sections.length === 0,
    () => ({
        style: { height: "100%" },
        mainViewStyle: {
            position: "absolute",
            top: "50%",
            width: "100%",
            transform: "translateY(-50%)"
        },
        // TODO: localize
        title: "NO CONTENT"
    })
)(SectionsPreview);

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
        setEditing: PropTypes.func
    };

    static defaultProps = {
        mode: Modes.VIEW,
        setEditing: () => {},
        story: {}
    };

    render() {
        return (<BorderLayout
                className="ms-geostory-builder"
                header={
                    <div
                        className="text-center ms-geostory-builder-header"
                        >
                        <Toolbar
                            btnDefaultProps={{
                                className: 'square-button-md',
                                bsStyle: 'primary'
                            }}
                            buttons={[
                                {
                                    glyph: 'trash',
                                    disabled: true
                                },
                                {
                                    glyph: 'eye-open',
                                    onClick: () => this.props.setEditing(this.props.mode === Modes.VIEW)
                                },
                                {
                                    glyph: 'cog',
                                    disabled: true

                                },
                                {
                                    glyph: 'list-alt',
                                    disabled: true
                                }
                            ]}/>
                    </div>
                }>
            <Previews
                sections={this.props.story && this.props.story.sections}
                />
            </BorderLayout>
        );
    }
}

export default Builder;
