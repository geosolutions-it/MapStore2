/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl as FormControlRB, Glyphicon as GlyphiconRB } from 'react-bootstrap';
import localizedProps from '../misc/enhancers/localizedProps';
import tooltip from '../misc/enhancers/tooltip';
import Loader from '../misc/Loader';

const FormControl = localizedProps('placeholder')(FormControlRB);
const Glyphicon = tooltip(GlyphiconRB);

/**
 * Component to preview an icon image based on a text input
 * @memberof components.styleeditor
 * @name IconInput
 * @class
 * @prop {string} value href of the image
 * @prop {function} onChange returns the updated href value of the image
 * @prop {function} onLoad callback to check if the image has been loaded correctly arguments: error and image url
 */
function IconInput({
    value,
    onChange,
    onLoad
}) {
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(true);
    const [imageUrl, setImageUrl] = useState(value);
    const onImgLoad = (newImageUrl) => {
        if (isMounted.current) {
            setLoading(false);
            setError(false);
            onLoad(false, newImageUrl);
        }
    };
    const onImgError = () => {
        if (isMounted.current) {
            setLoading(false);
            setError(true);
            onLoad(true);
        }
    };
    const onImgSourceChange = (newImageUrl, shouldUpdate) => {
        setImageUrl(newImageUrl);
        setLoading(true);
        setError(false);
        const img = new Image();
        img.onload = onImgLoad.bind(null, newImageUrl);
        img.onerror = onImgError;
        img.src = newImageUrl;
        // avoid to trigger onChange on component mount
        if (shouldUpdate) {
            onChange(newImageUrl);
        }
    };

    const initialValue = useRef(value);
    useEffect(() => {
        onImgSourceChange(initialValue.current);
    }, []);

    return (
        <div
            className="ms-style-editor-icon-input"
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FormGroup style={{ flex: 1 }}>
                <FormControl
                    style={{ paddingRight: 26 }}
                    placeholder="styleeditor.placeholderEnterImageUrl"
                    value={value}
                    onChange={event => onImgSourceChange(event.target.value, true)} />
            </FormGroup>
            <div
                style={{
                    position: 'absolute',
                    minWidth: 26,
                    minHeight: 26,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                {(imageUrl && !error && !loading) && <div
                    className="ms-style-editor-icon-input-image"
                    style={{
                        position: 'absolute',
                        margin: 2,
                        width: 'calc(100% - 2px)',
                        height: 'calc(100% - 2px)',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'contain'
                    }}
                />}
                {error && <Glyphicon
                    glyph="exclamation-sign"
                    tooltipId={imageUrl.length === 0
                        ? 'styleeditor.missingImageUrl'
                        : 'styleeditor.invalidImageUrl'
                    }
                />}
                {loading && <Loader size={20}/>}
            </div>
        </div>
    );
}

IconInput.propTypes = {
    value: PropTypes.bool,
    onChange: PropTypes.node,
    onLoad: PropTypes.object,
    onError: PropTypes.object
};

IconInput.defaultProps = {
    value: '',
    onChange: () => {},
    onLoad: () => {},
    onError: () => {}
};

export default IconInput;
