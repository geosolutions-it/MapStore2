/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Glyphicon as GlyphiconRB } from 'react-bootstrap';
import tooltip from '../misc/enhancers/tooltip';
import { isValidURLTemplate } from '../../utils/URLUtils';
import DebouncedFormControl from '../misc/DebouncedFormControl';

const Glyphicon = tooltip(GlyphiconRB);

function ModelInput({
    value,
    onChange,
    onError
}) {

    const [moduleUrl, setModuleUrl] = useState(value);
    const isValid = isValidURLTemplate(moduleUrl);

    useEffect(() => {
        onError(!isValid);
    }, [isValid]);

    const onModuleSourceChange = (newModelUrl) => {
        setModuleUrl(newModelUrl);
        if (isValidURLTemplate(newModelUrl)) {
            onChange(newModelUrl);
        }
    };

    return (
        <div
            className="ms-style-editor-model-input"
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FormGroup style={{ flex: 1 }}>
                <DebouncedFormControl
                    placeholder="styleeditor.placeholderEnterModelUrl"
                    style={{ paddingRight: 26 }}
                    value={moduleUrl}
                    debounceTime={300}
                    onChange={newModelUrl => onModuleSourceChange(newModelUrl)} />
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
                {!isValid
                    ? <Glyphicon
                        glyph="exclamation-sign"
                        tooltipId={`styleeditor.invalidModelUrl`}
                    />
                    : moduleUrl
                        ? <Glyphicon glyph="model"/>
                        : null}
            </div>
        </div>
    );
}

ModelInput.propTypes = {
    value: PropTypes.bool,
    onChange: PropTypes.node
};

ModelInput.defaultProps = {
    value: '',
    onChange: () => {}
};

export default ModelInput;
