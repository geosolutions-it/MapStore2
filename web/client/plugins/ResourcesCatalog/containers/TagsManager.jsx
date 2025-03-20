/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import FlexBox from "../../../components/layout/FlexBox";
import GeoStoreDAO from '../../../api/GeoStoreDAO';
import { castArray, isEmpty, omit, uniq } from 'lodash';
import useIsMounted from '../../../hooks/useIsMounted';
import ConfirmDialog from '../../../components/layout/ConfirmDialog';
import { searchResources, setSelectedResource } from '../actions/resources';
import TagsManagerPanel from '../components/TagsManagerPanel';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { getSelectedResource } from '../selectors/resources';

/**
 * TagsManager panel where to add/update/remove tags
 * @prop {string} pageSize size of the requested page
 * @prop {func} onShow callback to show/hide panel
 * @prop {func} onSearch callback used to refresh the searched resources and apply the correct tags
 */
function TagsManager({
    pageSize,
    onShow,
    onSearch,
    selectedResource,
    onSelectResource
}) {
    const [filterText, setFilterText] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [tags, setTags] = useState();
    const [changes, setChanges] = useState({});
    const [changed, setChanged] = useState(false);
    const [editing, setEditing] = useState([]);
    const [totalCount, setTotalCount] = useState();
    const [newTag, setNewTag] = useState(null);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [errorId, setErrorId] = useState('');

    const isMounted = useIsMounted();

    useEffect(() => {
        setLoading(true);
        setErrorId('');
        GeoStoreDAO.getTags(filterText ? `%${filterText}%` : undefined, {
            params: {
                page,
                entries: pageSize
            }
        }).then((response) => isMounted(() => {
            setTags(castArray(response?.TagList?.Tag || []));
            setTotalCount(response?.TagList?.Count);
        })).catch(() => isMounted(() => {
            setErrorId('resourcesCatalog.errorLoadingTags');
        })).finally(() => isMounted(() => {
            setLoading(false);
        }));
    }, [filterText, page, forceUpdate]);

    function handleStartEditing(tag) {
        setEditing(uniq([...editing, tag.id]));
    }

    function handleEndEditing(tag) {
        setEditing(uniq(editing.filter(id => id !== tag.id)));
        setChanges(omit(changes, tag.id));
    }

    function updateSelectedResource(tag, action) {
        const resourceTags = selectedResource?.tags || [];
        const shouldUpdate = !!resourceTags.find(resourceTag => resourceTag.id === tag.id);
        if (!shouldUpdate) {
            return null;
        }
        if (action === 'update') {
            return onSelectResource({
                ...selectedResource,
                tags: resourceTags.map((resourceTag) => resourceTag.id === tag.id ? { ...resourceTag, ...tag } : resourceTag)
            });
        }
        if (action === 'delete') {
            return onSelectResource({
                ...selectedResource,
                tags: resourceTags.filter((resourceTag) => resourceTag.id !== tag.id)
            });
        }
        return null;
    }

    function handleUpdate(tag) {
        setLoading(true);
        setErrorId('');
        GeoStoreDAO.updateTag(tag)
            .then(() => isMounted(() => {
                setForceUpdate(prevValue => prevValue + 1);
                if (tag.id) {
                    handleEndEditing(tag);
                    updateSelectedResource(tag, 'update');
                } else {
                    setNewTag(null);
                }
            }))
            .catch((error) => isMounted(() => {
                setErrorId(error.status === 409
                    ? 'resourcesCatalog.errorTagNameAlreadyExist'
                    : 'resourcesCatalog.errorUpdatingTag'
                );
            }))
            .finally(() => isMounted(() => {
                setLoading(false);
                setChanged(true);
            }));
    }

    function handleDelete(tag) {
        setLoading(true);
        setErrorId('');
        GeoStoreDAO.deleteTag(tag.id)
            .then(() => isMounted(() => {
                handleEndEditing(tag);
                updateSelectedResource(tag, 'delete');
                setForceUpdate(prevValue => prevValue + 1);
            }))
            .catch(() => isMounted(() => {
                setErrorId('resourcesCatalog.errorDeletingTag');
            }))
            .finally(() => isMounted(() => {
                setLoading(false);
                setChanged(true);
            }));
    }

    function handleCancelDelete() {
        setShowDeleteModal(null);
    }

    function handleConfirmDelete() {
        handleDelete(showDeleteModal);
        setShowDeleteModal(null);
    }

    function handleClose() {
        setShowCloseModal(false);
        onShow(false);
        if (changed) {
            onSearch({ refresh: true });
        }
    }

    function handleCloseDialog() {
        if (!newTag?.name && isEmpty(changes)) {
            handleClose();
            return;
        }
        setShowCloseModal(true);
    }

    return (
        <>
            <FlexBox centerChildren classNames={['ms-tags-manager', '_fixed', '_corner-tl', '_fill']}>
                <TagsManagerPanel
                    errorId={errorId}
                    pageSize={pageSize}
                    filterText={filterText}
                    setFilterText={setFilterText}
                    page={page}
                    setPage={setPage}
                    newTag={newTag}
                    setNewTag={setNewTag}
                    loading={loading}
                    onCloseDialog={handleCloseDialog}
                    onUpdate={handleUpdate}
                    changes={changes}
                    setChanges={setChanges}
                    totalCount={totalCount}
                    editing={editing}
                    tags={tags}
                    onEndEditing={handleEndEditing}
                    onStartEditing={handleStartEditing}
                    setShowDeleteModal={setShowDeleteModal}
                />
            </FlexBox>
            <ConfirmDialog
                show={!!showDeleteModal}
                preventHide
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                titleId={`resourcesCatalog.deleteTagTitle`}
                descriptionId={`resourcesCatalog.deleteTagDescription`}
                cancelId={`resourcesCatalog.deleteTagCancel`}
                confirmId={`resourcesCatalog.deleteTagConfirm`}
                variant="danger"
            />
            <ConfirmDialog
                show={!!showCloseModal}
                preventHide
                onCancel={() => setShowCloseModal(false)}
                onConfirm={handleClose}
                titleId={`resourcesCatalog.closeTagsTitle`}
                descriptionId={`resourcesCatalog.closeTagsDescription`}
                cancelId={`resourcesCatalog.closeTagsCancel`}
                confirmId={`resourcesCatalog.closeTagsConfirm`}
                variant="danger"
            />
        </>
    );
}

TagsManager.propTypes = {
    pageSize: PropTypes.number,
    onShow: PropTypes.func,
    onSearch: PropTypes.func
};

TagsManager.defaultProps = {
    pageSize: 20,
    onShow: () => {},
    onSearch: () => {}
};

const ConnectedTagsManager = connect(
    createStructuredSelector({
        selectedResource: getSelectedResource
    }),
    {
        onSearch: searchResources,
        onSelectResource: setSelectedResource
    }
)(TagsManager);

export default ConnectedTagsManager;
