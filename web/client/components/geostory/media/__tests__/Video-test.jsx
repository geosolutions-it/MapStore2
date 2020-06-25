/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Video from '../Video';
import { act } from 'react-dom/test-utils';
import { Modes } from '../../../../utils/GeoStoryUtils';

describe('Video component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with defaults', () => {
        ReactDOM.render(<Video />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-video')).toBeTruthy();
    });
    it('should render caption and credits and thumbnail', () => {
        ReactDOM.render(
            <Video
                src="path/to/video.mp4"
                thumbnail="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII="
                description="Description"
                credits="Credits"
                mode={Modes.VIEW}
                showCaption
            />, document.getElementById("container"));
        const mediaVideoNode = document.querySelector('.ms-media-video');
        expect(mediaVideoNode).toBeTruthy();
        const thumbnailNode = mediaVideoNode.querySelector('.ms-video-cover');
        expect(thumbnailNode).toBeTruthy();
        expect(thumbnailNode.style.backgroundImage
            .match('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=')
        ).toBeTruthy();

        const captionNode = mediaVideoNode.querySelector('.ms-media-caption > small');
        expect(captionNode).toBeTruthy();
        expect(captionNode.innerHTML).toBe('Description');

        const creditsNode = mediaVideoNode.querySelector('.ms-media-credits > small');
        expect(creditsNode).toBeTruthy();
        expect(creditsNode.innerHTML).toBe('Credits');
    });
    it('should play if in view and autoplay is enabled (VIEW mode)', (done) => {
        ReactDOM.render(
            <Video
                src="path/to/video.mp4"
                autoplay
                inView
                mode={Modes.VIEW}
                onPlay={(playing) => {
                    try {
                        expect(playing).toBe(true);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />
            , document.getElementById("container"));
        const mediaVideoNode = document.querySelector('.ms-media-video');
        expect(mediaVideoNode).toBeTruthy();
        const thumbnailNode = document.querySelector('.ms-video-cover');
        expect(thumbnailNode).toBeTruthy();
    });
    it('should stop if not view (VIEW mode)', (done) => {
        act(() => {
            ReactDOM.render(<Video key="video" src="path/to/video.mp4" autoplay inView mode={Modes.VIEW} />, document.getElementById("container"));
        });
        const mediaVideoNode = document.querySelector('.ms-media-video');
        expect(mediaVideoNode).toBeTruthy();
        const thumbnailNode = document.querySelector('.ms-video-cover');
        expect(thumbnailNode).toBeTruthy();
        act(() => {
            ReactDOM.render(<Video
                key="video"
                src="path/to/video.mp4"
                autoplay
                inView={false}
                mode={Modes.VIEW}
                onPlay={(playing) => {
                    try {
                        expect(playing).toBe(false);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
    });
    it('should play if in view and fit is equal to cover (VIEW mode)', (done) => {
        ReactDOM.render(
            <Video
                src="path/to/video.mp4"
                fit="cover"
                inView
                mode={Modes.VIEW}
                onPlay={(playing) => {
                    try {
                        expect(playing).toBe(true);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />
            , document.getElementById("container"));
        const mediaVideoNode = document.querySelector('.ms-media-video');
        expect(mediaVideoNode).toBeTruthy();
        const thumbnailNode = document.querySelector('.ms-video-cover');
        expect(thumbnailNode).toBeTruthy();
    });

    it('should play if returns in view and fit equal to cover (VIEW mode)', (done) => {
        act(() => {
            ReactDOM.render(<Video
                key="video"
                src="path/to/video.mp4"
                fit="cover"
                inView
                mode={Modes.VIEW}
            />, document.getElementById("container"));
        });
        const mediaVideoNode = document.querySelector('.ms-media-video');
        expect(mediaVideoNode).toBeTruthy();
        const thumbnailNode = document.querySelector('.ms-video-cover');
        expect(thumbnailNode).toBeTruthy();
        act(() => {
            ReactDOM.render(<Video
                key="video"
                src="path/to/video.mp4"
                fit="cover"
                inView={false}
                mode={Modes.VIEW}
            />, document.getElementById("container"));
        });
        act(() => {
            ReactDOM.render(<Video
                key="video"
                src="path/to/video.mp4"
                fit="cover"
                inView
                mode={Modes.VIEW}
                onPlay={(playing) => {
                    try {
                        expect(playing).toBe(true);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
    });

    it('should play if returns in view and autoplay is enabled (VIEW mode)', (done) => {
        act(() => {
            ReactDOM.render(<Video
                key="video"
                src="path/to/video.mp4"
                fit="contain"
                autoplay
                inView
                mode={Modes.VIEW}
            />, document.getElementById("container"));
        });
        const mediaVideoNode = document.querySelector('.ms-media-video');
        expect(mediaVideoNode).toBeTruthy();
        const thumbnailNode = document.querySelector('.ms-video-cover');
        expect(thumbnailNode).toBeTruthy();
        act(() => {
            ReactDOM.render(<Video
                key="video"
                src="path/to/video.mp4"
                fit="contain"
                autoplay
                inView={false}
                mode={Modes.VIEW}
            />, document.getElementById("container"));
        });
        act(() => {
            ReactDOM.render(<Video
                key="video"
                src="path/to/video.mp4"
                fit="contain"
                autoplay
                inView
                mode={Modes.VIEW}
                onPlay={(playing) => {
                    try {
                        expect(playing).toBe(true);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
    });

    it('should stop and reset the player while switching deom VIEW to EDIT mode', (done) => {
        act(() => {
            ReactDOM.render(
                <Video
                    src="path/to/video.mp4"
                    inView
                    mode={Modes.VIEW}
                />, document.getElementById("container"));
        });

        act(() => {
            ReactDOM.render(
                <Video
                    src="path/to/video.mp4"
                    inView
                    mode={Modes.EDIT}
                    onPlay={(playing) => {
                        try {
                            expect(playing).toBe(false);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}
                />, document.getElementById("container"));
        });

        const mediaVideoNode = document.querySelector('.ms-media-video');
        expect(mediaVideoNode).toBeTruthy();
        const thumbnailNode = document.querySelector('.ms-video-cover');
        expect(thumbnailNode).toBeTruthy();
    });
});
