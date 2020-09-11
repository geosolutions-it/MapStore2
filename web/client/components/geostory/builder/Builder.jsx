/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';

import { Modes, lists } from '../../../utils/GeoStoryUtils';
import Message from '../../I18N/Message';
import BorderLayout from '../../layout/BorderLayout';
import Toolbar from '../../misc/toolbar/Toolbar';
import ToolbarButton from '../../misc/toolbar/ToolbarButton';
import withConfirm from '../../misc/withConfirm';
import SectionsPreview from './SectionsPreview';
import Settings from './Settings';

const WithConfirmButton = withConfirm(ToolbarButton);
/**
 * Base Component that shows basic editing tools and SlidesPreview
 * of a geo-story.
 * @param {object} [story] the current story editing
 * @param {string} [mode='view'] can be 'edit' or 'view'
 * @param {function} [setEditing] handler for setEditing button in toolbar
 */

class Builder extends React.Component {

    static propTypes = {
        currentPage: PropTypes.object,
        settingsItems: PropTypes.array,
        story: PropTypes.object,
        settings: PropTypes.object,
        mode: PropTypes.oneOf(lists.Modes),
        onToggleCardPreview: PropTypes.func,
        onToggleSettingsPanel: PropTypes.func,
        onToggleSettings: PropTypes.func,
        onUpdateSettings: PropTypes.func,
        isCollapsed: PropTypes.bool,
        isToolbarEnabled: PropTypes.bool,
        isSettingsEnabled: PropTypes.bool,
        isSettingsChanged: PropTypes.bool,
        scrollTo: PropTypes.func,
        setEditing: PropTypes.func,
        onSort: PropTypes.func,
        onSelect: PropTypes.func,
        onRemove: PropTypes.func,
        onUpdate: PropTypes.func,
        selected: PropTypes.string,
        storyFonts: PropTypes.array
    };

    static defaultProps = {
        mode: Modes.VIEW,
        setEditing: () => {},
        onToggleCardPreview: () => {},
        onToggleSettingsPanel: () => {},
        story: {},
        settings: {},
        isCollapsed: true,
        isToolbarEnabled: true,
        isSettingsEnabled: false,
        onSort: () => {}
    };
    render() {
        const {
            story,
            settings,
            scrollTo,
            setEditing,
            mode,
            isCollapsed,
            isToolbarEnabled,
            isSettingsEnabled,
            isSettingsChanged,
            settingsItems,
            onToggleCardPreview,
            onToggleSettingsPanel,
            onToggleSettings,
            onUpdateSettings,
            currentPage,
            selected,
            onRemove,
            onSort,
            onUpdate,
            onSelect,
            storyFonts
        } = this.props;
        const SettingsButton = isSettingsChanged ? WithConfirmButton : ToolbarButton;
        return (<BorderLayout
            className="ms-geostory-builder"
            header={
                <div
                    className="text-center ms-geostory-builder-header"
                >
                    <Toolbar
                        btnDefaultProps={{
                            className: "square-button-md",
                            bsStyle: "primary"
                        }}
                        transitionProps={false}
                        buttons={[
                            {
                                visible: !isSettingsEnabled,
                                Element: () => (<WithConfirmButton
                                    glyph="trash"
                                    bsStyle= "primary"
                                    className="square-button-md no-border"
                                    tooltipId="geostory.builder.delete"
                                    confirmTitle={<Message msgId="geostory.contentToolbar.removeConfirmTitle" />}
                                    disabled= {!isToolbarEnabled || !selected }
                                    confirmContent={<Message msgId="geostory.contentToolbar.removeConfirmContent" />}
                                    onClick={ () => {
                                        onRemove(selected && `sections[{ "id": "${selected}" }]` || "");
                                    }} />)
                            },
                            {
                                tooltipId: "geostory.builder.preview",
                                glyph: "preview",
                                visible: !isSettingsEnabled,
                                disabled: !isToolbarEnabled,
                                onClick: () => setEditing(mode === Modes.VIEW)
                            },
                            {
                                tooltipId: "geostory.builder.settings.tooltip",
                                glyph: "cog",
                                id: "geostory-builder-settings-button",
                                visible: !isSettingsEnabled,
                                onClick: () => onToggleSettingsPanel()
                            },
                            {
                                tooltipId: `geostory.builder.${isCollapsed ? "expandAll" : "collapseAll"}`,
                                glyph: isCollapsed ? "chevron-left" : "chevron-down",
                                bsStyle: "primary",
                                disabled: !isToolbarEnabled,
                                visible: !isSettingsEnabled,
                                onClick: () => onToggleCardPreview()
                            },
                            {
                                // TODO i18n
                                visible: isSettingsEnabled,
                                Element: () => (<SettingsButton
                                    bsStyle= "primary"
                                    glyph="arrow-left"
                                    className="square-button-md no-border"
                                    tooltipId="geostory.builder.settings.back"
                                    confirmTitle={<Message msgId="geostory.builder.settings.backConfirmTitle" />}
                                    confirmContent={<Message msgId="geostory.builder.settings.backConfirmBody" />}
                                    confirmNo={<Message msgId="geostory.builder.settings.backConfirmNo" />}
                                    confirmYes={<Message msgId="geostory.builder.settings.backConfirmYes" />}
                                    onClick={ () => {
                                        onToggleSettingsPanel();
                                    }} />)
                            },
                            {
                                tooltipId: `geostory.builder.settings.save`,
                                glyph: "floppy-disk",
                                visible: isSettingsEnabled,
                                onClick: () => onToggleSettingsPanel(true)
                            }
                        ]}/>
                </div>
            }>
            {isSettingsEnabled && <Settings
                items={settingsItems}
                settings={settings}
                onToggleSettings={onToggleSettings}
                onUpdateSettings={onUpdateSettings}
                storyFonts={storyFonts}
            />}
            {isToolbarEnabled && !isSettingsEnabled ? <SectionsPreview
                currentPage={currentPage}
                scrollTo={scrollTo}
                onSelect={onSelect}
                selected={selected}
                onUpdate={onUpdate}
                isCollapsed={isCollapsed}
                sections={story && story.sections}
                onSort={onSort}
            /> : !isSettingsEnabled ? <div className="ms-story-empty-content-parent">
                <div className="ms-story-empty-content-child">
                    <Message msgId="geostory.builder.noContents" />
                </div>
            </div> : null}
        </BorderLayout>
        );
    }
}

export default Builder;
