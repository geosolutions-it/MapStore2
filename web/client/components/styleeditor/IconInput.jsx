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
import withDebounceOnCallback from '../misc/enhancers/withDebounceOnCallback';
import Loader from '../misc/Loader';
import { validateImageSrc } from '../../utils/StyleEditorUtils';

function FormControlOnChange(props) {
    return <FormControlRB { ...props } onChange={(event) => props.onChange(event.target.value)} />;
}

const FormControl = withDebounceOnCallback('onChange', 'value')(
    localizedProps('placeholder')(FormControlOnChange)
);

const Glyphicon = tooltip(GlyphiconRB);

/**
 * Component to preview an icon image based on a text input
 * @memberof components.styleeditor
 * @name IconInput
 * @class
 * @prop {string} value href of the image
 * @prop {function} onChange returns the updated href value of the image
 * @prop {function} onLoad callback to check if the image has been loaded correctly
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

    const onImgSourceChange = (newImageUrl, shouldUpdate) => {
        setImageUrl(newImageUrl);
        setLoading(true);
        setError(false);
        validateImageSrc(newImageUrl)
            .then((response) => {
                if (isMounted.current) {
                    let newError = false;
                    if (response.isBase64) {
                        newError = { type: 'warning', messageId: 'imageSrcNotSupportedBase64Image' };
                    }
                    setError(newError);
                    setLoading(false);
                    onLoad(newError, newImageUrl);
                }
            })
            .catch((response) => {
                if (isMounted.current) {
                    const newError = !response.isBase64 && response.messageId === 'imageSrcLoadError'
                        // if the image is an url and cannot be loaded
                        // we should only warn the user
                        // it could be only a connection issue
                        ? { type: 'warning', messageId: response.messageId }
                        : { type: 'error', messageId: response.messageId };
                    setError(newError);
                    setLoading(false);
                    onLoad(newError, newImageUrl);
                }
            });
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
                    debounceTime={300}
                    onChange={newImageUrl => onImgSourceChange(newImageUrl, true)} />
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
                    tooltipId={`styleeditor.${error.messageId}`}
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
