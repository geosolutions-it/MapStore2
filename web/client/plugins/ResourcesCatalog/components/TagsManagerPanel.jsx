/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from "./FlexBox";
import ButtonComponent from './Button';
import Icon from './Icon';
import InputControl from './InputControl';
import Message from '../../../components/I18N/Message';
import Text from './Text';
import tinycolor from 'tinycolor2';
import PaginationCustom from './PaginationCustom';
import tooltip from '../../../components/misc/enhancers/tooltip';
import Spinner from './Spinner';
import TagsManagerEntry from './TagsManagerEntry';

const Button = tooltip(ButtonComponent);

function TagsManagerPanel({
    pageSize,
    filterText,
    setFilterText,
    page,
    setPage,
    newTag,
    setNewTag,
    loading,
    onCloseDialog,
    onUpdate,
    changes,
    setChanges,
    totalCount,
    editing,
    tags,
    onEndEditing,
    onStartEditing,
    setShowDeleteModal
}) {

    return (
        <FlexBox classNames={['ms-tags-manager-panel', '_relative', 'ms-main-colors']} column>
            <FlexBox gap="sm" classNames={['_padding-sm']}>
                <FlexBox.Fill flexBox gap="sm" centerChildrenVertically>
                    <InputControl
                        value={filterText}
                        placeholder="resourcesCatalog.filterTags"
                        onChange={(value) => {
                            setFilterText(value);
                            setPage(0);
                        }}
                        debounceTime={300}
                        style={{ maxWidth: 300 }}
                    />
                    {loading ?  <Spinner /> : null}
                </FlexBox.Fill>
                <Button
                    variant="primary"
                    disabled={!!newTag}
                    onClick={() => setNewTag({
                        name: '',
                        description: '',
                        color: tinycolor.random().toHexString()
                    })}
                >
                    <Message msgId="resourcesCatalog.newTag" />
                </Button>
                <Button
                    square
                    borderTransparent
                    onClick={onCloseDialog}
                >
                    <Icon glyph="1-close" type="glyphicon"/>
                </Button>
            </FlexBox>
            {newTag ? (
                <TagsManagerEntry
                    classNames={['ms-secondary-colors', '_padding-sm', '_margin-b-sm']}
                    name={newTag.name}
                    color={newTag.color}
                    description={newTag.description}
                    editing
                    onChange={(newProperties) => setNewTag({ ...newTag, ...newProperties })}
                >
                    <Button
                        onClick={() => setNewTag(null)}
                    >
                        <Message msgId="resourcesCatalog.cancel" />
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => onUpdate(newTag)}
                        disabled={!newTag?.name}
                    >
                        <Message msgId="resourcesCatalog.create" />
                    </Button>
                </TagsManagerEntry>
            ) : null}
            {!tags?.length
                ? <FlexBox.Fill flexBox centerChildren classNames={['_padding-tb-lg']}>
                    <div>
                        <Text fontSize="xxl" textAlign="center">
                            <Icon glyph="tags" type="glyphicon" />
                        </Text>
                        <Text fontSize="lg" textAlign="center">
                            <Message msgId={`resourcesCatalog.${filterText ? 'noFilteredTagsAvailable' : 'noTagsAvailable'}`} />
                        </Text>
                        <Text fontSize="ms" textAlign="center">
                            <Message msgId={`resourcesCatalog.${filterText ? 'noFilteredTagsAvailableDescription' : 'noTagsAvailableDescription'}`} />
                        </Text>
                    </div>
                </FlexBox.Fill>
                : <FlexBox.Fill flexBox component="ul" column gap="sm" classNames={['_overflow-auto', '_padding-sm']}>
                    {tags.map((tagEntry) => {
                        const tag = { ...tagEntry, ...changes[tagEntry.id] };
                        const isEditing = editing.includes(tag.id);
                        return (
                            <li id={tag.id}>
                                <TagsManagerEntry
                                    name={tag.name}
                                    color={tag.color}
                                    description={tag.description}
                                    editing={isEditing}
                                    onChange={(newProperties) => setChanges({
                                        ...changes,
                                        [tag.id]: {
                                            ...changes[tag.id],
                                            ...newProperties
                                        }
                                    })}
                                >
                                    {isEditing
                                        ? <>
                                            <Button
                                                onClick={() => onEndEditing(tag)}
                                            >
                                                <Message msgId="resourcesCatalog.cancel" />
                                            </Button>
                                            <Button
                                                variant="success"
                                                disabled={!changes[tag.id] || !tag?.name}
                                                onClick={() => onUpdate(tag)}
                                            >
                                                <Message msgId="resourcesCatalog.update" />
                                            </Button>
                                        </>
                                        : <>
                                            <Button
                                                square
                                                onClick={() => onStartEditing(tag)}
                                                tooltipId="resourcesCatalog.editTag"
                                            >
                                                <Icon glyph="edit" type="glyphicon" />
                                            </Button>
                                            <Button
                                                square
                                                onClick={() => setShowDeleteModal(tag)}
                                                tooltipId="resourcesCatalog.deleteTag"
                                            >
                                                <Icon glyph="trash" type="glyphicon" />
                                            </Button>
                                        </>}
                                </TagsManagerEntry>
                            </li>
                        );
                    })}
                </FlexBox.Fill>}
            <FlexBox classNames={['_padding-sm']} centerChildren>
                {!!totalCount ? <PaginationCustom
                    items={Math.ceil(totalCount / pageSize)}
                    activePage={page + 1}
                    onSelect={(value) => {
                        setPage(value - 1);
                    }}
                /> : null}
            </FlexBox>
        </FlexBox>
    );
}

export default TagsManagerPanel;
