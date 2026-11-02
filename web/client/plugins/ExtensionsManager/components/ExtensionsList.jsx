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
import SideCard from '../../../components/misc/cardgrids/SideCard';
import { MANAGER_TOOL_GLYPH } from '../constants';

// The context creator lists only the plugins of the catalog without `hidden: true`.
const ContextsAvailability = ({ inContexts }) => (
    <Text fontSize="sm" component="span" className={inContexts ? 'ms-extension-plugin-in-contexts' : 'ms-extension-plugin-not-in-contexts'}>
        <Glyphicon glyph={inContexts ? 'ok' : 'minus'} />{' '}
        <Message msgId={inContexts ? 'extensionsManager.pluginInContexts' : 'extensionsManager.pluginNotInContexts'} />
    </Text>
);

// Plugins are drawn with the cards that the context creator uses for its plugins.
const ExtensionPlugins = ({ plugins }) => (
    <div className="ms-extension-plugins">
        <Text fontSize="sm" strong><Message msgId="extensionsManager.plugins" /></Text>
        {plugins.map(plugin => (
            <SideCard
                key={plugin.name}
                className="ms-extension-plugin"
                size="sm"
                preview={<Glyphicon glyph={plugin.glyph || MANAGER_TOOL_GLYPH} />}
                title={<span className="ms-extension-plugin-name">{plugin.title || plugin.name}</span>}
                description={<span className="ms-extension-plugin-version">{plugin.version || '-'}</span>}
                caption={<ContextsAvailability inContexts={plugin.inContexts} />}
            />
        ))}
    </div>
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
 * List of the installed extensions, drawn as the resource cards of the catalog in list layout.
 * @prop {object[]} extensions installed extensions `[{ name, title, description, version, glyph, plugins }]`,
 * where `plugins` lists name, title, version and glyph of each plugin of the extension and whether contexts can use it
 * @prop {function} renderTools returns the tools of an extension (e.g. uninstall), optional
 */
function ExtensionsList({ extensions, renderTools }) {
    if (!extensions.length) {
        return <EmptyList />;
    }
    return (
        <FlexBox component="ul" column gap="sm" classNames={['ms-extensions-list', '_padding-sm']}>
            {extensions.map(extension => (
                <FlexBox component="li" key={extension.name}
                    classNames={['ms-extensions-list-entry', 'ms-resource-card', 'ms-resource-card-type-list', 'ms-main-colors', '_interactive']}>
                    <FlexBox centerChildren className="ms-resource-card-img ms-image-colors">
                        <Text fontSize="xxl"><Glyphicon glyph={extension.glyph || MANAGER_TOOL_GLYPH} /></Text>
                    </FlexBox>
                    <FlexBox.Fill flexBox column gap="sm" classNames={['_padding-sm']}>
                        <FlexBox gap="sm" centerChildrenVertically>
                            <FlexBox.Fill>
                                <Text fontSize="md" strong className="ms-extension-title">{extension.title}</Text>
                            </FlexBox.Fill>
                            <Text fontSize="sm" className="ms-extension-version">{extension.version}</Text>
                            {renderTools ? renderTools(extension) : null}
                        </FlexBox>
                        <Text fontSize="sm" className="ms-extension-name">{extension.name}</Text>
                        <Text fontSize="sm" className="ms-extension-description ms-resource-card-description">{extension.description}</Text>
                        {extension.plugins?.length ? <ExtensionPlugins plugins={extension.plugins} /> : null}
                    </FlexBox.Fill>
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
