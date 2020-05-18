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

/**
 * Video component
 * @prop {string} src source of the video
 * @prop {number} resolution resolution of the video
 * @prop {string} fit one of `cover`, `contain` or undefined
 * @prop {string} thumbnail source of thumbnail
 * @prop {boolean} controls enable/disable video controls
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
    fit
}) => {

    const playing = play;
    const [started, setStarted] = useState(playing);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(play);

    const isCover = fit === 'cover';

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

    const containerHeight = (fit === 'contain' || fit === 'cover') ? height : size[1];

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
                ...(isCover && { cursor: 'pointer '})
            }}
            onClick={() => {
                if (started && isCover) {
                    onPlay(!playing);
                }
            }}>
            {src &&
            <>
            {started && <ReactPlayer
                url={src}
                width={size[0]}
                height={size[1]}
                playing={playing}
                style={isCover
                    ? {
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        position: 'absolute'
                    } : {}}
                controls={controls && !isCover}
                pip={false}
                fileConfig={{
                    attributes: {
                        controlsList: 'nodownload',
                        disablePictureInPicture: true
                    }
                }}
                youtubeConfig={{
                    playerVars: {
                        controls: controls ? 2 : 0,
                        modestbranding: 1,
                        rel: 0
                    }
                }}
                onReady={() => setLoading(false)}
                onError={e => setError(e)}
                onPause={() => onPlay(false)}
                onPlay={() => onPlay(true)}
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
                        backgroundSize: '640px auto',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    })
                }}
                onClick={() => {
                    setStarted(true);
                    setLoading(true);
                    onPlay(true);
                }}>
                {loading && <Loader size={70}/>}
                {error && 'Error'}
                {!(loading || error) && !playing &&
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
 * @prop {string} description video description
 * @prop {boolean} descriptionEnabled display/hide description
 * @prop {string} thumbnail source of thumbnail
 * @prop {string} credits source of thumbnail
 * @prop {boolean} controls enable/disable video controls
 * @prop {function} onPlay on play callback
 */
const VideoMedia = ({
    id,
    src,
    resolution = 16 / 9,
    autoplay,
    inView,
    description,
    descriptionEnabled = true,
    thumbnail,
    credits,
    controls = true,
    fit,
    onPlay = () => {}
}) => {

    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);

    const handleOnPlay = (newPlaying) => {
        setPlaying(newPlaying);
        onPlay(newPlaying);
    };

    useEffect(() => {
        if (inView && autoplay && !started) {
            handleOnPlay(true);
        }
    }, [ inView, autoplay, started ]);

    useEffect(() => {
        if (!inView && playing) {
            handleOnPlay(false);
        }
    }, [inView, playing]);

    return (
        <div
            id={id}
            key={id}
            className="ms-media ms-media-video">
            <Video
                src={src}
                play={playing}
                resolution={resolution}
                thumbnail={thumbnail}
                controls={controls}
                onPlay={handleOnPlay}
                onStart={setStarted}
                fit={fit}
            />
            {credits && <div className="ms-media-credits">
                <small>
                    {credits}
                </small>
            </div>}
            {descriptionEnabled && description && <div className="ms-media-description">
                <small>
                    {description}
                </small>
            </div>}
        </div>
    );
};

export default VideoMedia;
