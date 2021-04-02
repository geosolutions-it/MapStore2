/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Loader from '../../misc/Loader';
import { withResizeDetector } from 'react-resize-detector';
import { Glyphicon } from 'react-bootstrap';
import { Modes } from '../../../utils/GeoStoryUtils';
import Message from '../../I18N/Message';

/**
 * Video component
 * @prop {string} src source of the video
 * @prop {number} resolution resolution of the video
 * @prop {string} fit one of `cover`, `contain` or undefined
 * (`cover` provides a video covering the available space provided by its own container
 * and it has loop and autoplay enabled and controls not visible by default)
 * @prop {string} loop loop the video (loop has no effect for fit equal to `cover`)
 * @prop {string} volume change the volume of video, value between 0.0 and 1.0
 * @prop {string} muted mute the video audio
 * @prop {string} thumbnail source of thumbnail
 * @prop {boolean} controls enable/disable video controls (controls has no effect for fit equal to `cover`)
 * @prop {boolean} play play/stop the video
 * @prop {function} onPlay on playing event callback
 * @prop {function} onStart on start event callback
 */
const Video = withResizeDetector(({
    src,
    width,
    height,
    resolution,
    thumbnail,
    controls,
    play,
    onPlay = () => {},
    onStart = () => {},
    fit,
    loop,
    volume = 1,
    muted
}) => {

    const playing = play;
    const [started, setStarted] = useState(playing);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(play);
    // we have only message error, doesn't have the code
    const AUTOPLAY_ERROR = `NotAllowedError`;


    const isCover = fit === 'cover';
    const [autoPlayError, setAutoPlayError] = useState(false);

    useEffect(() => {
        if (!started && playing) {
            setStarted(true);
            setLoading(true);
        }
        if (started) {
            onStart(started);
        }
    }, [started, playing]);

    function getSize() {
        const containerResolution = width / height;
        if (isCover) {
            return containerResolution < resolution
                ? [ height * resolution, height]
                : [ width, width / resolution ];
        }
        if (fit === 'contain') {
            return containerResolution < resolution
                ? [ width, width / resolution]
                : [ height * resolution, height];
        }
        return [ width, width / resolution];
    }

    const size = getSize();

    const containerHeight = (fit === 'contain' || isCover) ? height : size[1];

    const showControls = isCover ? false : controls;
    const forceLoop = isCover ? true : loop;

    const handlePlay = () => {
        onPlay(true);
        // in autoPlay Error case, reset the error status to force the video play
        if (autoPlayError) {
            setError(false);
            setAutoPlayError(false);
        }

    };

    const handlePause = () => {
        onPlay(false);
    };

    const handleError = (e) => {
        setError(e);
        // cast the error message, we don't have the error code available
        let errorMsg = '' + e;
        // check we are in NotAllowedError case
        if (errorMsg.includes(AUTOPLAY_ERROR)) {
            onPlay(false);
            setAutoPlayError(true);
            setLoading(false);
        }
    };

    const handleOnclick = () => {
        if (autoPlayError) {
            setAutoPlayError(false);
            setError(false);
        } else {
            setLoading(true);
        }
        setStarted(true);
        onPlay(true);

    };

    return (
        <div
            className="ms-video"
            style={{
                position: 'relative',
                width,
                height: containerHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
            {src &&
            <>
                {started && <ReactPlayer
                    url={src}
                    width={size[0]}
                    height={size[1]}
                    playing={playing}
                    loop={forceLoop}
                    volume={volume}
                    muted={muted}
                    style={isCover
                        ? {
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            position: 'absolute'
                        } : {}}
                    controls={showControls}
                    pip={false}
                    fileConfig={{
                        attributes: {
                            controlsList: 'nodownload',
                            disablePictureInPicture: true
                        }
                    }}
                    youtubeConfig={{
                        playerVars: {
                            controls: showControls ? 2 : 0,
                            modestbranding: 1,
                            rel: 0
                        }
                    }}
                    onReady={() => setLoading(false)}
                    onError={handleError}
                    onPause={handlePause}
                    onPlay={handlePlay}
                />}
                {(!started || started && (loading || error)) && <div
                    className="ms-video-cover"
                    style={{
                        position: 'absolute',
                        width: size[0],
                        height: size[1],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 1.0)',
                        ...(!(loading || error) && { cursor: 'pointer' }),
                        ...(!playing && thumbnail && {
                            backgroundImage: `url(${thumbnail})`,
                            backgroundSize: isCover ? 'cover' : '640px auto',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        })
                    }}
                    onClick={handleOnclick}>
                    {loading && <Loader size={70}/>}
                    {(error && !autoPlayError) && <div className="text-center" ><Glyphicon
                        glyph="alert"
                        style={{
                            fontSize: size[1] / 4 > 100 ? 100 : size[1] / 4,
                            mixBlendMode: 'difference',
                            color: '#ffffff'
                        }}
                    /><h3><Message msgId="geostory.errors.loading.video"/></h3> </div>
                    }
                    {((!(loading || error) && !playing) || (error && autoPlayError)) &&
                        <Glyphicon
                            glyph="play"
                            style={{
                                fontSize: size[1] / 4 > 100 ? 100 : size[1] / 4,
                                mixBlendMode: 'difference',
                                color: '#ffffff'
                            }}
                        />}
                </div>}
            </>}
            {(!showControls && !autoPlayError ) && <div
                className="ms-video-mask-cover"
                style={{
                    position: 'absolute',
                    width: size[0],
                    height: size[1]
                }}>
            </div>}
        </div>
    );
});

/**
 * Video Media component
 * @prop {string} id unique id that represent the media
 * @prop {string} src source of the video
 * @prop {number} resolution resolution of the video
 * @prop {boolean} autoplay play the video when is in view
 * @prop {boolean} inView define if the video si in the window view
 * @prop {string} fit one of `cover`, `contain` or undefined
 * (`cover` provides a video covering the available space provided by its own container
 * and it has loop and autoplay enabled and controls not visible by default)
 * @prop {string} loop loop the video (loop has no effect for fit equal to `cover`)
 * @prop {string} muted mute the video audio
 * @prop {string} caption caption of current content
 * @prop {string} description description of video resource
 * @prop {boolean} showCaption display/hide caption
 * @prop {string} thumbnail source of thumbnail
 * @prop {string} credits source of thumbnail
 * @prop {boolean} controls enable/disable video controls (controls has no effect for fit equal to `cover`)
 * @prop {function} onPlay on play callback
 * @prop {string} mode one of 'view' or 'edit'
 * @prop {boolean} containerInView define if the container is in view, useful for scrollable container with content with position sticky eg. Backgrounds
 */
const VideoMedia = ({
    id,
    src,
    resolution = 16 / 9,
    autoplay,
    inView,
    description,
    showCaption,
    caption = description,
    thumbnail,
    credits,
    controls = true,
    fit,
    loop,
    muted,
    onPlay = () => {},
    mode,
    containerInView = true
}) => {

    // ensure both container and content are visible
    const isVisible = containerInView && inView;

    const [playing, setPlaying] = useState(false);

    const handleOnPlay = (newPlaying) => {
        setPlaying(newPlaying);
        onPlay(newPlaying);
    };

    // reset player after switching from view to edit mode
    useEffect(() => {
        if (mode === Modes.EDIT) {
            handleOnPlay(false);
        }
    }, [ mode ]);

    // every time the video is in view it should play if autoplay is enabled or fit equal to cover
    useEffect(() => {
        if (mode === Modes.VIEW
        && isVisible
        && (autoplay || fit === 'cover')) {
            handleOnPlay(true);
        }
    }, [ isVisible, autoplay, fit, mode ]);

    // video should stop when it is not in view
    useEffect(() => {
        if (mode === Modes.VIEW && !isVisible && playing) {
            handleOnPlay(false);
        }
    }, [isVisible, playing, mode]);

    return (
        <div
            id={id}
            key={`${id}-${fit}-${mode}`}
            className="ms-media ms-media-video">
            <Video
                src={src}
                play={playing && mode === Modes.VIEW}
                resolution={resolution}
                thumbnail={thumbnail}
                controls={controls && mode === Modes.VIEW}
                onPlay={handleOnPlay}
                fit={fit}
                loop={loop}
                muted={muted}
            />
            {credits && <div className="ms-media-credits">
                <small>
                    {credits}
                </small>
            </div>}
            {showCaption && caption && <div className="ms-media-caption">
                <small>
                    {caption}
                </small>
            </div>}
        </div>
    );
};

export default VideoMedia;
