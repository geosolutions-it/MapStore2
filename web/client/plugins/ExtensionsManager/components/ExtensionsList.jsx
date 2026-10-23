/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Message from '../../../components/I18N/Message';
import { MANAGER_TOOL_GLYPH } from '../constants';

// Extensions with `hidden: true` add no tool to the contexts, so the context creator does not list them.
const ContextCreatorVisibility = ({ hidden }) => (
    <Text fontSize="sm" className={hidden ? 'ms-extension-hidden' : 'ms-extension-listed'}>
        <Message msgId={hidden ? 'extensionsManager.hiddenInContextCreator' : 'extensionsManager.listedInContextCreator'} />
    </Text>
);

const EmptyList = () => (
    <FlexBox.Fill flexBox centerChildren classNames={['_padding-tb-lg']}>
        <div>
            <Text fontSize="xxl" textAlign="center"><Glyphicon glyph={MANAGER_TOOL_GLYPH} /></Text>
            <Text fontSize="lg" textAlign="center"><Message msgId="extensionsManager.noExtensions" /></Text>
            <Text fontSize="ms" textAlign="center"><Message msgId="extensionsManager.noExtensionsDescription" /></Text>
        </div>
    </FlexBox.Fill>
);

/**
 * List of the installed extensions.
 * @prop {object[]} extensions installed extensions `[{ name, title, description, version, hidden }]`
 * @prop {function} renderTools returns the tools of an extension (e.g. uninstall), optional
 */
function ExtensionsList({ extensions, renderTools }) {
    if (!extensions.length) {
        return <EmptyList />;
    }
    return (
        <FlexBox component="ul" column gap="sm" classNames={['ms-extensions-list', '_padding-sm']}>
            {extensions.map(extension => (
                <FlexBox component="li" key={extension.name} gap="md" centerChildrenVertically
                    classNames={['ms-extensions-list-entry', 'ms-secondary-colors', '_padding-sm']}>
                    <FlexBox.Fill>
                        <Text fontSize="md" strong className="ms-extension-title">{extension.title}</Text>
                        <Text fontSize="sm" className="ms-extension-name">{extension.name}</Text>
                        <Text fontSize="sm" className="ms-extension-description">{extension.description}</Text>
                    </FlexBox.Fill>
                    <Text fontSize="sm" className="ms-extension-version">{extension.version}</Text>
                    <ContextCreatorVisibility hidden={extension.hidden} />
                    {renderTools ? renderTools(extension) : null}
                </FlexBox>
            ))}
        </FlexBox>
    );
}

ExtensionsList.propTypes = {
    extensions: PropTypes.array,
    renderTools: PropTypes.func
};

ExtensionsList.defaultProps = {
    extensions: []
};

export default ExtensionsList;
