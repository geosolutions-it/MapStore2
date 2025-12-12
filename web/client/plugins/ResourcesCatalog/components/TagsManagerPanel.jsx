/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Glyphicon } from 'react-bootstrap';

import FlexBox from "../../../components/layout/FlexBox";
import ButtonComponent from '../../../components/layout/Button';
import InputControl from './InputControl';
import Message from '../../../components/I18N/Message';
import Text from '../../../components/layout/Text';
import tinycolor from 'tinycolor2';
import PaginationCustom from './PaginationCustom';
import tooltip from '../../../components/misc/enhancers/tooltip';
import Spinner from '../../../components/layout/Spinner';
import TagsManagerEntry from './TagsManagerEntry';

const Button = tooltip(ButtonComponent);

/**
 * TagsManagerPanel panel
 * @prop {string} pageSize size of the requested page
 * @prop {string} filterText applied text filter
 * @prop {func} setFilterText callback to update the filterText
 * @prop {number} page current requested page
 * @prop {func} setPage callback to update the page
 * @prop {object} newTag new tag object { name, description, color }
 * @prop {func} setNewTag callback to update the new tag
 * @prop {bool} loading loading state
 * @prop {func} onUpdate callback to trigger update action
 * @prop {object} changes object storing tags changes { [tagId]: { ...changes }, }
 * @prop {func} setChanges callback to update the changes object
 * @prop {number} totalCount total tags count
 * @prop {string[]} editing list of tag ids in edit mode
 * @prop {object[]} tags list of tags [{ id, name, description, color },]
 * @prop {func} onEndEditing callback to end editing
 * @prop {func} onStartEditing callback to start editing
 * @prop {func} setShowDeleteModal callback to initialize the delete process
 * @prop {string} errorId error message id
 */
function TagsManagerPanel({
    errorId,
    pageSize,
    filterText,
    setFilterText,
    page,
    setPage,
    newTag,
    setNewTag,
    loading,
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
                    variant="success"
                    disabled={!!newTag}
                    onClick={() => setNewTag({
                        name: '',
                        description: '',
                        color: tinycolor.random().toHexString()
                    })}
                >
                    <Message msgId="resourcesCatalog.newTag" />
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
                    editingTools={
                        <>
                            <Button
                                square
                                onClick={() => onUpdate(newTag)}
                                disabled={!newTag?.name}
                                className={!newTag?.name ? undefined : 'ms-notification-circle warning'}
                                tooltipId="resourcesCatalog.create"
                            >
                                <Glyphicon glyph="floppy-disk" />
                            </Button>
                            <Button
                                square
                                onClick={() => setNewTag(null)}
                                tooltipId="resourcesCatalog.cancel"
                            >
                                <Glyphicon glyph="1-close" />
                            </Button>
                        </>
                    }
                />
            ) : null}
            {!tags?.length
                ? <FlexBox.Fill flexBox centerChildren classNames={['_padding-tb-lg']}>
                    <div>
                        <Text fontSize="xxl" textAlign="center">
                            <Glyphicon glyph="tags" />
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
                                    editingTools={
                                        <>
                                            <Button
                                                square
                                                disabled={!changes[tag.id] || !tag?.name}
                                                onClick={() => onUpdate(tag)}
                                                className={(!changes[tag.id] || !tag?.name) ? undefined : 'ms-notification-circle warning'}
                                                tooltipId="resourcesCatalog.update"
                                            >
                                                <Glyphicon glyph="floppy-disk" />
                                            </Button>
                                            <Button
                                                square
                                                onClick={() => onEndEditing(tag)}
                                                tooltipId="resourcesCatalog.cancel"
                                            >
                                                <Glyphicon glyph="1-close" />
                                            </Button>
                                        </>
                                    }
                                >
                                    {!isEditing ? <Button
                                        square
                                        onClick={() => onStartEditing(tag)}
                                        tooltipId={'resourcesCatalog.editTag'}
                                    >
                                        <Glyphicon glyph="edit" />
                                    </Button> : null}
                                    <Button
                                        square
                                        onClick={() => setShowDeleteModal(tag)}
                                        tooltipId="resourcesCatalog.deleteTag"
                                    >
                                        <Glyphicon glyph="trash" />
                                    </Button>
                                </TagsManagerEntry>
                            </li>
                        );
                    })}
                </FlexBox.Fill>}
            {errorId ? (
                <FlexBox component={Alert} bsStyle="danger" classNames={['_padding-sm']} centerChildren>
                    <Message msgId={errorId} />
                </FlexBox>
            ) : null}
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


TagsManagerPanel.propTypes = {
    errorId: PropTypes.string,
    pageSize: PropTypes.number,
    filterText: PropTypes.string,
    setFilterText: PropTypes.func,
    page: PropTypes.number,
    setPage: PropTypes.func,
    newTag: PropTypes.object,
    setNewTag: PropTypes.func,
    loading: PropTypes.bool,
    onCloseDialog: PropTypes.func,
    onUpdate: PropTypes.func,
    changes: PropTypes.object,
    setChanges: PropTypes.func,
    totalCount: PropTypes.number,
    editing: PropTypes.bool,
    tags: PropTypes.array,
    onEndEditing: PropTypes.func,
    onStartEditing: PropTypes.func,
    setShowDeleteModal: PropTypes.func
};

TagsManagerPanel.defaultProps = {
    changes: {},
    editing: [],
    setFilterText: () => {},
    setPage: () => {},
    setNewTag: () => {},
    onCloseDialog: () => {},
    onUpdate: () => {},
    setChanges: () => {},
    onEndEditing: () => {},
    onStartEditing: () => {},
    setShowDeleteModal: () => {}
};

export default TagsManagerPanel;
