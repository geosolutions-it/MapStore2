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
    UNKNOWN: ({type}) => <div className="ms-section ms-section-unknown">WARNING: unknown session of type {type}</div>
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
        addSection: PropTypes.fun,
        mode: PropTypes.oneOf(lists.Modes),
        contents: PropTypes.array,
        viewHeight: PropTypes.number,
        viewWidth: PropTypes.number,
        excludeClassName: PropTypes.string,
        cover: PropTypes.boolean
    };

    static defaultProps = {
        id: '',
        addSection: () => {},
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
                id={this.props.id}
                addSection={this.props.addSection}
                mode={this.props.mode}
                cover={this.props.cover}
                contents={this.props.contents}
                viewWidth={this.props.viewWidth}
                viewHeight={this.props.viewHeight}/>
        );
    }
}

export default Section;
