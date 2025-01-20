/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { getAuthKeyParameter, getAuthenticationMethod, getToken } from '../../utils/SecurityUtils';

// TODO: move to utils
function appendParamToUrl(url, paramKey, paramValue) {
    // Check if the URL already has query parameters
    const delimiter = url.includes('?') ? '&' : '?';

    // If there's already a query string, append the new parameter; otherwise, start a new query string
    return `${url}${delimiter}${encodeURIComponent(paramKey)}=${encodeURIComponent(paramValue)}`;
}


const SecureImage = ({
    alt,
    src,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState('');

    // Function to validate the image once it loads
    const validateImg = (imgElement) => {
        // Implement your validation logic here
        // For example, check image dimensions, aspect ratio, etc.
        if (imgElement.naturalWidth === 0 || imgElement.naturalHeight === 0) {
            console.error('Image validation failed: Image is not valid.');
        }
    };

    useEffect(() => {
        const authMethod = getAuthenticationMethod(src);

        if (authMethod === "bearer") {
            axios.get(src, {
                responseType: 'blob'
            })
                .then((response) => {
                    const imageUrl = URL.createObjectURL(response.data);
                    setImageSrc(imageUrl);
                })
                .catch((error) => {
                    console.error('Error fetching image:', error);
                });
        } else if (authMethod === "authkey") {
            const authParam = getAuthKeyParameter(src);
            const token = getToken();
            if (authParam && token) {
                const newSrc = appendParamToUrl(src, authParam, token);
                setImageSrc(newSrc);
            } else {
                setImageSrc(src);
            }

        } else {
            setImageSrc(src);
        }

        // Clean up the URL object when the component unmounts
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    return (
        <img
            alt={alt}
            onError={(e) => {
                if (imageSrc) {
                    props.onImgError(e);
                }
            }}
            onLoad={(e) => validateImg(e.target)}
            src={imageSrc}
            style={props.style}
            {...props}
        />
    );
};

export default SecureImage;
