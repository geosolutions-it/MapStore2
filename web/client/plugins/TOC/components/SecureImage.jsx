/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { securityTokenSelector } from '../../../selectors/security';

const SecureImage = connect(
    createSelector(
        securityTokenSelector,
        (token) => {
            return { token };
        }
    ),
    {}
)(({
    alt,
    src,
    token,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState('');

    useEffect(() => {
        const fetchImage = async() => {
            try {
                const response = await fetch(src, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    setImageSrc(imageUrl);
                } else {
                    console.error('Failed to fetch image:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching image:', error);
            }
        };

        fetchImage();

        // Clean up the URL object when the component unmounts
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src, token]);

    return (
        <img src={imageSrc} alt={alt} {...props} />
    );
});

export default SecureImage;
