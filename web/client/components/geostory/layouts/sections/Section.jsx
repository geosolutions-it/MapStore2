/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { lists, Modes, StoryTypes, SectionTypes} from '../../../../utils/GeoStoryUtils';
import Immersive from './Immersive';
import Paragraph from './Paragraph';
import Title from './Title';

const types = {
    [SectionTypes.IMMERSIVE]: Immersive,
    [SectionTypes.PARAGRAPH]: Paragraph,
    [SectionTypes.TITLE]: Title,
    UNKNOWN: ({type}) => <div className="unknown-session-type">WARNING: unknown session of type {type}</div>
};

/**
 * Generic Container for a Story Section
 * Adds the AddSection button on button, then render the specific
 * section by type.
 */
class Section extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.oneOf(lists.SectionTypes),
        storyType: PropTypes.oneOf(lists.StoryTypes),
        mode: PropTypes.oneOf(lists.Modes),
        contents: PropTypes.array,
        viewHeight: PropTypes.number,
        viewWidth: PropTypes.number,
        excludeClassName: PropTypes.string
    };

    static defaultProps = {
        id: '',
        storyType: StoryTypes.CASCADE,
        viewHeight: 0,
        viewWidth: 0,
        mode: Modes.VIEW
    };

    state = {
        height: 0
    };

    render() {
        const SectionType = types[this.props.type] || types.UNKNOWN;
        return (
            <SectionType
                type={this.props.type}
                mode={this.props.mode}
                contents={this.props.contents}
                viewHeight={this.props.viewHeight}
                className={`ms-section ms-${this.props.storyType}-section${this.props.type ? ` ms-section-${this.props.type}` : ''}`}/>
        );
    }
}

export default Section;
