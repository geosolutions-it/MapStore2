/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from "../../../components/layout/FlexBox";
import InputControl from './InputControl';
import Message from '../../../components/I18N/Message';
import Text from '../../../components/layout/Text';
import ColorSelector from '../../../components/style/ColorSelector';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { getTagColorVariables } from '../utils/ResourcesFiltersUtils';

/**
 * TagsManagerEntry represents the tag entry UI available in read or edit mode
 * @prop {string} name tag name
 * @prop {string} description tag description
 * @prop {string} color tag color in hex
 * @prop {bool} editing enabled the edit mode
 * @prop {func} onChange callback to update tag properties
 * @prop {string[]} classNames additional class names
 * @prop {number} debounceTime debounce time for input fields
 */
function TagsManagerEntry({
    name,
    description,
    color,
    children,
    editing,
    onChange,
    classNames,
    debounceTime,
    editingTools
}) {

    if (editing) {
        return (
            <FlexBox classNames={['ms-tags-manager-entry', '_row', '_padding-tb-xs', ...classNames]} gap="sm" column>
                <FlexBox gap="sm" centerChildrenVertically>
                    <FlexBox.Fill flexBox gap="sm" centerChildrenVertically>
                        <Text ellipsis classNames={['ms-tag']} style={getTagColorVariables(color)}>{name || <Message msgId="resourcesCatalog.tagPreview" />}</Text>
                    </FlexBox.Fill>
                    {children}
                </FlexBox>
                <FlexBox gap="sm">
                    <FormGroup>
                        <ControlLabel><Message msgId="resourcesCatalog.tagName" /></ControlLabel>
                        <InputControl
                            value={name}
                            debounceTime={debounceTime}
                            onChange={(value) => onChange({ name: value })}
                            maxLength={255}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="resourcesCatalog.tagDescription" /></ControlLabel>
                        <InputControl
                            value={description}
                            debounceTime={debounceTime}
                            onChange={(value) => onChange({ description: value })}
                            maxLength={255}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="resourcesCatalog.tagColor" /></ControlLabel>
                        <div className="ms-main-colors">
                            <ColorSelector
                                placement="top"
                                key={color}
                                color={color}
                                format={'hex'}
                                disableAlpha
                                presetColors={[]}
                                onChangeColor={(value) => onChange({ color: value })}
                            />
                        </div>
                    </FormGroup>
                    <FlexBox gap="sm" classNames={['ms-tags-manager-entry-tools']}>
                        {editingTools}
                    </FlexBox>
                </FlexBox>
            </FlexBox>
        );
    }
    return (
        <FlexBox classNames={['ms-tags-manager-entry', '_row', '_padding-tb-xs', ...classNames]} gap="sm">
            <FlexBox.Fill flexBox gap="sm" centerChildrenVertically>
                <Text ellipsis classNames={['ms-tag']} style={getTagColorVariables(color)}>{name}</Text>
                <Text ellipsis>{description}</Text>
            </FlexBox.Fill>
            {children}
        </FlexBox>
    );
}

TagsManagerEntry.propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    color: PropTypes.string,
    editing: PropTypes.bool,
    onChange: PropTypes.func,
    classNames: PropTypes.array,
    debounceTime: PropTypes.number
};

TagsManagerEntry.defaultProps = {
    onChange: () => {},
    classNames: [],
    debounceTime: 300
};

export default TagsManagerEntry;
