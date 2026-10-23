/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Alert } from 'react-bootstrap';

import FlexBox from '../../../components/layout/FlexBox';
import Spinner from '../../../components/layout/Spinner';
import Button from '../../../components/layout/Button';
import Message from '../../../components/I18N/Message';
import UploadExtensionsDialog from '../../../components/extensions/UploadExtensionsDialog';
import { upload } from '../../../api/plugins';
import { loadExtensions } from '../../../actions/contextcreator';
import { checkUploads } from '../../../utils/ExtensionsUtils';
import { getMessageById } from '../../../utils/LocaleUtils';
import { showResult } from '../actions/extensionsManager';
import { resultSelector } from '../selectors/extensionsManager';
import ExtensionsList from '../components/ExtensionsList';
import useInstalledExtensions from '../hooks/useInstalledExtensions';

// An installed extension is replaced by a zip with the same plugin name.
const markReplaced = (checked, extensions) => checked.map(entry => {
    const installed = !entry.error && extensions.find(extension => extension.name === entry.name);
    return installed
        ? { ...entry, replaces: installed, warning: <Message msgId="extensionsManager.replacesVersion" msgParams={{ current: installed.version || '-', next: entry.version || '-' }} /> }
        : entry;
});

/**
 * Tab of the manager with the installed extensions.
 * The result of an action is shown in the tab, because the manager page has no notifications.
 * @prop {object} result result of the last action `{ msgId, params }`
 * @prop {function} onShowResult shows the result of an action, null hides it
 * @prop {function} onLoadExtensions loads the installed extensions in the application
 */
function ExtensionsManagerTool({ result, onShowResult, onLoadExtensions }, { messages }) {
    const { extensions, loading, error, reload } = useInstalledExtensions();
    const [showUpload, setShowUpload] = useState(false);
    const [toUpload, setToUpload] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    const closeUpload = () => {
        setShowUpload(false);
        setToUpload([]);
        setUploadStatus(null);
    };
    const checkFiles = files => checkUploads(files, [], msgId => getMessageById(messages, msgId))
        .then(checked => setToUpload(current => [...current, ...markReplaced(checked, extensions)]));
    const install = () => {
        const valid = toUpload.filter(entry => !entry.error);
        setUploading(true);
        return upload(valid.map(entry => entry.file))
            .then(() => {
                setUploading(false);
                closeUpload();
                onLoadExtensions();
                onShowResult({ msgId: valid.some(entry => entry.replaces) ? 'extensionsManager.updatedMessage' : 'extensionsManager.installedMessage' });
                return reload();
            })
            .catch(e => {
                setUploading(false);
                setUploadStatus({ result: 'error', error: e });
            });
    };

    return (
        <FlexBox classNames={['ms-extensions-manager', '_relative', 'ms-main-colors']} column>
            <FlexBox gap="sm" centerChildrenVertically classNames={['_padding-sm']}>
                <FlexBox.Fill>{loading ? <Spinner /> : null}</FlexBox.Fill>
                <Button variant="success" className="ms-extensions-install" onClick={() => { onShowResult(null); setShowUpload(true); }}>
                    <Message msgId="extensionsManager.install" />
                </Button>
            </FlexBox>
            {error ? <Alert bsStyle="danger"><Message msgId="extensionsManager.loadError" /></Alert> : null}
            {result ? <Alert bsStyle="success" className="ms-extensions-result" onDismiss={() => onShowResult(null)}>
                <Message msgId={result.msgId} msgParams={result.params} />
            </Alert> : null}
            <ExtensionsList extensions={extensions} />
            {showUpload ? <UploadExtensionsDialog
                toUpload={toUpload}
                onDrop={checkFiles}
                onRemove={index => setToUpload(toUpload.filter((entry, i) => i !== index))}
                onInstall={install}
                onClose={closeUpload}
                isUploading={uploading}
                uploadStatus={uploadStatus}
            /> : null}
        </FlexBox>
    );
}

ExtensionsManagerTool.propTypes = {
    result: PropTypes.object,
    onShowResult: PropTypes.func,
    onLoadExtensions: PropTypes.func
};

ExtensionsManagerTool.contextTypes = {
    messages: PropTypes.object
};

ExtensionsManagerTool.defaultProps = {
    onShowResult: () => {},
    onLoadExtensions: () => {}
};

export default connect(createStructuredSelector({
    result: resultSelector
}), {
    onShowResult: showResult,
    onLoadExtensions: loadExtensions
})(ExtensionsManagerTool);
