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
import Banner from './Banner';

import visibilityHandler from '../../contents/enhancers/visibilityHandler';

const types = {
    [SectionTypes.IMMERSIVE]: Immersive,
    [SectionTypes.PARAGRAPH]: Paragraph,
    [SectionTemplates.MEDIA]: Paragraph,
    [SectionTemplates.WEBPAGE]: Paragraph,
    [SectionTypes.TITLE]: Title,
    [SectionTypes.BANNER]: Banner,
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
        editWebPage: PropTypes.func,
        remove: PropTypes.func,
        updateCurrentPage: PropTypes.func,
        mode: PropTypes.oneOf(lists.Modes),
        contents: PropTypes.array,
        viewHeight: PropTypes.number,
        viewWidth: PropTypes.number,
        inViewRef: PropTypes.func,
        excludeClassName: PropTypes.string,
        cover: PropTypes.bool,
        focusedContent: PropTypes.object,
        expandableMedia: PropTypes.bool,
        storyTheme: PropTypes.object,
        mediaViewer: PropTypes.func,
        contentToolbar: PropTypes.func,
        inView: PropTypes.bool,
        sections: PropTypes.array,
        storyFonts: PropTypes.array
    };

    static defaultProps = {
        id: '',
        add: () => {},
        update: () => {},
        editMedia: () => {},
        editWebPage: () => {},
        updateCurrentPage: () => {},
        remove: () => {},
        storyType: StoryTypes.CASCADE,
        viewHeight: 0,
        viewWidth: 0,
        mode: Modes.VIEW,
        expandableMedia: false,
        sections: [],
        storyFonts: []
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
                expandableMedia={this.props.expandableMedia}
                editWebPage={this.props.editWebPage}
                updateCurrentPage={this.props.updateCurrentPage}
                remove={this.props.remove}
                mode={this.props.mode}
                cover={this.props.cover}
                contents={this.props.contents}
                viewWidth={this.props.viewWidth}
                viewHeight={this.props.viewHeight}
                focusedContent={this.props.focusedContent}
                storyTheme={this.props.storyTheme}
                mediaViewer={this.props.mediaViewer}
                contentToolbar={this.props.contentToolbar}
                inView={this.props.inView}
                sections={this.props.sections}
                storyFonts={this.props.storyFonts}
            />
        );
    }
}
// We have to try to reduce the number of times that an interceptor observer call the onVisibility change
// Less items better performance worst precision
const DEFAULT_THRESHOLD = [0, 0.25, 0.5, 0.75, 1];

// add the visibilityHandler to intercept current section (for current page state update)
/*
 * negative rootMargin allows to get the top element highlighted (trigger visibility event)
 * if it's present in the viewport after initial 100px
*/
export default visibilityHandler({ threshold: DEFAULT_THRESHOLD, rootMargin: "-200px 0px 0px 0px" })(Section);
