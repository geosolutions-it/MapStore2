/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { lists, Modes, StoryTypes, SectionTypes, SectionTemplates} from '../../../../utils/GeoStoryUtils';
import Immersive from './Immersive';
import Paragraph from './Paragraph';
import Title from './Title';

import visibilityHandler from '../../contents/enhancers/visibilityHandler';

const types = {
    [SectionTypes.IMMERSIVE]: Immersive,
    [SectionTypes.PARAGRAPH]: Paragraph,
    [SectionTemplates.MEDIA]: Paragraph,
    [SectionTypes.TITLE]: Title,
    UNKNOWN: ({ type, inViewRef }) => <div ref={inViewRef} className="ms-section ms-section-unknown">WARNING: unknown session of type {type}</div>
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
        add: PropTypes.func,
        update: PropTypes.func,
        editMedia: PropTypes.func,
        remove: PropTypes.func,
        mode: PropTypes.oneOf(lists.Modes),
        contents: PropTypes.array,
        viewHeight: PropTypes.number,
        viewWidth: PropTypes.number,
        inViewRef: PropTypes.func,
        excludeClassName: PropTypes.string,
        cover: PropTypes.bool
    };

    static defaultProps = {
        id: '',
        add: () => {},
        update: () => {},
        editMedia: () => {},
        remove: () => {},
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
                sectionType={this.props.type}
                id={this.props.id}
                add={this.props.add}
                update={this.props.update}
                inViewRef={this.props.inViewRef}
                editMedia={this.props.editMedia}
                remove={this.props.remove}
                mode={this.props.mode}
                cover={this.props.cover}
                contents={this.props.contents}
                viewWidth={this.props.viewWidth}
                viewHeight={this.props.viewHeight}
            />
        );
    }
}
const DEFAULT_THRESHOLD = Array.from(Array(11).keys()).map(v => v / 10); // [0, 0.1, 0.2 ... 0.9, 1]

// add the visibilityHandler to intercept current section (for current page state update)
export default visibilityHandler({ threshold: DEFAULT_THRESHOLD })(Section);
