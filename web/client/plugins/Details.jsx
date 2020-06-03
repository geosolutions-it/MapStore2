/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { get } from "lodash";

import {
    save,
    edit,
    close,
    cancelEdit,
    setEditorState,
    setContentChanged,
    changeSetting
} from '../actions/details';
import {
    detailsControlEnabledSelector,
    contentSelector,
    contentChangedSelector,
    editingSelector,
    settingsSelector,
    loadingSelector,
    loadFlagsSelector,
    editedSettingsSelector,
    editorStateSelector
} from '../selectors/details';
import { setControlProperty } from '../actions/controls';
import { mapFromIdSelector } from '../selectors/maps';
import { mapInfoSelector, mapIdSelector, mapInfoDetailsUriFromIdSelector } from '../selectors/map';
import { isLoggedIn } from '../selectors/security';

import DetailsDialog from '../components/details/DetailsDialog';
import DetailsPanel from '../components/details/DetailsPanel';
import DetailsHeader from '../components/details/DetailsHeader';
import Details from '../components/details/Details';
import editors from '../components//details/editors';
import { withConfirmOverride } from '../components/misc/withConfirm';

import Message from '../components/I18N/Message';
import { createPlugin } from '../utils/PluginsUtils';

import details from '../reducers/details';
import * as epics from '../epics/details';

const DetailsPlugin = ({
    show,
    editing,
    canEdit,
    editor = 'DraftJSEditor',
    editorProps,
    editedSettings,
    loading,
    content,
    contentChanged,
    onSave,
    onEdit,
    onCancelEdit,
    onClose,
    onSettingsChange
}) => {
    const Container = editedSettings?.showAsModal ? DetailsDialog : DetailsPanel;

    return (
        <Container
            editing={editing}
            loading={loading}
            show={show}
            containerClassName={editing && editors[editor].containerClassName}
            header={<DetailsHeader
                editing={editing}
                canEdit={canEdit}
                contentChanged={contentChanged}
                settings={editedSettings}
                loading={loading}
                onEdit={onEdit}
                onCancelEdit={onCancelEdit}
                onSave={() => onSave(editors[editor].fromEditorState(editorProps?.editorState))}
                onSettingsChange={onSettingsChange}/>}
            onClose={onClose}>
            <Details
                editing={editing}
                editor={editor}
                loading={loading}
                editorProps={editorProps}
                detailsText={content}/>
        </Container>
    );
};


/**
 * Details plugin used for fetching details of the map
 * @class
 * @memberof plugins
 */

export default createPlugin('Details', {
    component: compose(
        connect((state) => ({
            show: detailsControlEnabledSelector(state),
            loading: loadingSelector(state),
            loadFlags: loadFlagsSelector(state),
            mapInfo: mapInfoSelector(state),
            canEdit: isLoggedIn(state) && get(mapInfoSelector(state), 'canEdit'),
            settings: settingsSelector(state),
            editedSettings: editedSettingsSelector(state),
            map: mapFromIdSelector(state, mapIdSelector(state)),
            content: contentSelector(state),
            contentChanged: contentChangedSelector(state),
            editing: editingSelector(state),
            editorProps: {
                editorState: editorStateSelector(state)
            }
        }), {
            onSave: save,
            onEdit: edit.bind(null, true),
            onCancelEdit: cancelEdit,
            onClose: close,
            onSettingsChange: changeSetting,
            onEditorUpdate: setEditorState,
            setContentChanged
        }, (stateProps, dispatchProps, ownProps) => ({
            ...stateProps,
            ...ownProps,
            onSave: dispatchProps.onSave,
            onEdit: dispatchProps.onEdit,
            onCancelEdit: dispatchProps.onCancelEdit,
            onClose: dispatchProps.onClose,
            onSettingsChange: dispatchProps.onSettingsChange,
            editorProps: {
                ...(stateProps.editorProps || {}),
                ...(ownProps.editorProps || {}),
                onUpdate: dispatchProps.onEditorUpdate,
                setContentChanged: dispatchProps.setContentChanged
            }
        })),
        Component => props => (
            <Component
                confirmPredicate={!!props.editing && !!props.contentChanged}
                confirmContent={<Message msgId="details.confirmClose"/>}
                {...props}/>
        ),
        withConfirmOverride('onClose', 'onCancelEdit')
    )(DetailsPlugin),
    containers: {
        BurgerMenu: {
            name: 'details',
            position: 1000,
            priority: 1,
            doNotHide: true,
            text: <Message msgId="details.title"/>,
            icon: <Glyphicon glyph="sheet"/>,
            action: setControlProperty.bind(null, 'details', 'enabled', true),
            selector: (state) => {
                const mapId = mapIdSelector(state);
                const detailsUri = mapId && mapInfoDetailsUriFromIdSelector(state, mapId);
                if (detailsUri) {
                    return {};
                }
                return { style: {display: "none"} };
            }
        },
        Toolbar: {
            name: 'details',
            position: 1,
            priority: 4,
            alwaysVisible: true,
            doNotHide: true,
            icon: <Glyphicon glyph="sheet"/>,
            action: setControlProperty.bind(null, 'details', 'enabled', true),
            selector: (state) => {
                const mapId = mapIdSelector(state);
                const detailsUri = mapId && mapInfoDetailsUriFromIdSelector(state, mapId);
                if (detailsUri) {
                    return {};
                }
                return { style: {display: "none"} };
            }
        }
    },
    reducers: {
        details
    },
    epics
});
