/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from 'prop-types';

import stickySupport from '../../../misc/enhancers/stickySupport';
import Media, { typesMap } from '../../media';
import { lists, getClassNameFromProps, Modes } from '../../../../utils/GeoStoryUtils';
import DefaultContentToolbar from '../../contents/ContentToolbar';
import { Portal } from 'react-overlays';
import pattern from './patterns/grid.svg';
import { SectionTypes, getThemeStyleFromProps } from './../../../../utils/GeoStoryUtils';

/**
 * Background.
 * This component provides a sticky container inside the Sections.
 */

class Background extends Component {

    static propTypes = {
        id: PropTypes.string,
        resourceId: PropTypes.string,
        sectionId: PropTypes.string,
        mode: PropTypes.string,
        fit: PropTypes.string,
        size: PropTypes.string,
        path: PropTypes.string,
        credits: PropTypes.string,
        description: PropTypes.string,
        height: PropTypes.number,
        width: PropTypes.number,
        tools: PropTypes.object,
        style: PropTypes.object,
        add: PropTypes.func,
        editMedia: PropTypes.func,
        update: PropTypes.func,
        updateSection: PropTypes.func,
        remove: PropTypes.func,
        type: PropTypes.oneOf(lists.MediaTypes),
        disableToolbarPortal: PropTypes.bool,
        backgroundPlaceholder: PropTypes.object,
        sectionType: PropTypes.string,
        src: PropTypes.string,
        theme: PropTypes.string,
        mediaViewer: PropTypes.func,
        contentToolbar: PropTypes.func,
        inView: PropTypes.bool
    };

    static defaultProps = {
        height: 0,
        size: 'full',
        width: 0,
        style: {},
        backgroundPlaceholder: {
            background: `url(${pattern})`,
            backgroundSize: '256px auto'
        }
    };

    render() {
        const theme = getThemeStyleFromProps(this.props);
        const parentNode = !this.props.disableToolbarPortal && this.refs && this.refs.div && this.refs.div.parentNode;
        const defaultTools = this.props.sectionType === SectionTypes.TITLE ? ['editMedia', 'cover' ] : ['editMedia' ];
        const ContentToolbar = this.props.contentToolbar || DefaultContentToolbar;
        const toolbar = (
            <ContentToolbar
                {...this.props}
                themeProps={{
                    disableBackgroundAlpha: true,
                    disableTextColor: true,
                    disableShadow: true
                }}
                tools={
                    this.props.tools && this.props.type && this.props.tools[this.props.type]
                    || this.props.sectionType === SectionTypes.BANNER && [...defaultTools, 'cover', 'remove']
                    || defaultTools
                }
            />
        );

        const id = `${this.props.sectionId || "ms"}-media-${(this.props.id || this.props.resourceId)}`;

        return (
            <div
                ref="div"
                className="ms-section-background"
                style={{ ...this.props.style }}>
                <div
                    className={`ms-section-background-container${getClassNameFromProps(this.props)}`}
                    style={{
                        height: this.props.height,
                        ...theme,
                        ...(!typesMap?.[this.props.type]
                            ? this.props.backgroundPlaceholder
                            : {})
                    }}>
                    <Media
                        id={id}
                        {...this.props}
                        enableFullscreen={false}
                        descriptionEnabled={false}
                        mediaViewer={this.props.mediaViewer}
                        containerInView={this.props.inView}
                    />
                    { this.props.mode === Modes.EDIT && (
                        parentNode
                            ? (
                                <Portal
                                    container={parentNode}>
                                    {toolbar}
                                </Portal>
                            )
                            : toolbar)}
                </div>
            </div>
        );
    }
}

export default stickySupport()(Background);

