/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from "./FlexBox";
import InputControl from './InputControl';
import Message from '../../../components/I18N/Message';
import Text from './Text';
import ColorSelector from '../../../components/style/ColorSelector';
import { ControlLabel, FormGroup } from 'react-bootstrap';

function TagsManagerEntry({
    name,
    description,
    color,
    children,
    editing,
    onChange,
    classNames = []
}) {

    if (editing) {
        return (
            <FlexBox classNames={['ms-tags-manager-entry', '_row', '_padding-tb-xs', ...classNames]} gap="sm" column>
                <FlexBox gap="sm" centerChildrenVertically>
                    <FlexBox.Fill flexBox gap="sm" centerChildrenVertically>
                        <Text ellipsis classNames={['ms-tag', 'active']} style={{ '--tag-color': color }}>{name || <Message msgId="resourcesCatalog.tagPreview" />}</Text>
                    </FlexBox.Fill>
                    {children}
                </FlexBox>
                <FlexBox gap="sm" centerChildrenVertically>
                    <FormGroup>
                        <ControlLabel><Message msgId="resourcesCatalog.tagName" /></ControlLabel>
                        <InputControl
                            value={name}
                            debounceTime={300}
                            onChange={(value) => onChange({ name: value })}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel><Message msgId="resourcesCatalog.tagDescription" /></ControlLabel>
                        <InputControl
                            value={description}
                            debounceTime={300}
                            onChange={(value) => onChange({ description: value })}
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
                </FlexBox>
            </FlexBox>
        );
    }
    return (
        <FlexBox classNames={['ms-tags-manager-entry', '_row', '_padding-tb-xs', ...classNames]} gap="sm">
            <FlexBox.Fill flexBox gap="sm" centerChildrenVertically>
                <Text ellipsis classNames={['ms-tag', 'active']} style={{ '--tag-color': color }}>{name}</Text>
                <Text ellipsis>{description}</Text>
            </FlexBox.Fill>
            {children}
        </FlexBox>
    );
}

export default TagsManagerEntry;
