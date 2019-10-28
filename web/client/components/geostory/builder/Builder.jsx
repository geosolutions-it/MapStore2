/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

import BorderLayout from '../../layout/BorderLayout';
import SectionsPreview from './SectionsPreview';
import Settings from './Settings';
import Toolbar from '../../misc/toolbar/Toolbar';
import { lists, Modes } from '../../../utils/GeoStoryUtils';
import withConfirm from '../../misc/toolbar/withConfirm';
import Message from '../../I18N/Message';
import ToolbarButton from '../../misc/toolbar/ToolbarButton';
const DeleteButton = withConfirm(ToolbarButton);
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
        mode: PropTypes.oneOf(lists.Modes),
        onToggleCardPreview: PropTypes.func,
        onToggleSettingsPanel: PropTypes.func,
        onToggleSettings: PropTypes.func,
        isCollapsed: PropTypes.bool,
        isToolbarEnabled: PropTypes.bool,
        isSettingsEnabled: PropTypes.bool,
        scrollTo: PropTypes.func,
        setEditing: PropTypes.func,
        onSort: PropTypes.func,
        onSelect: PropTypes.func,
        onRemove: PropTypes.func,
        onUpdate: PropTypes.func,
        selected: PropTypes.string
    };

    static defaultProps = {
        mode: Modes.VIEW,
        setEditing: () => {},
        onToggleCardPreview: () => {},
        onToggleSettingsPanel: () => {},
        onToggleSettings: () => {},
        story: {},
        isCollapsed: true,
        isToolbarEnabled: true,
        isSettingsEnabled: true,
        onSort: () => {}
    };

    render() {
        const {
            story,
            scrollTo,
            setEditing,
            mode,
            isCollapsed,
            isToolbarEnabled,
            isSettingsEnabled,
            settingsItems,
            onToggleCardPreview,
            onToggleSettingsPanel,
            onToggleSettings,
            currentPage,
            selected,
            onRemove,
            onSort,
            onUpdate,
            onSelect
        } = this.props;
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
                        buttons={[
                            {
                                Element: () => (<DeleteButton
                                    glyph="trash"
                                    visible
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
                                glyph: "eye-open",
                                disabled: !isToolbarEnabled,
                                onClick: () => setEditing(mode === Modes.VIEW)
                            },
                            {
                                tooltipId: "geostory.builder.settings.tooltip",
                                glyph: "cog",
                                onClick: () => onToggleSettingsPanel()
                            },
                            {
                                tooltipId: `geostory.builder.${isCollapsed ? "expandAll" : "collapseAll"}`,
                                glyph: isCollapsed ? "chevron-left" : "chevron-down",
                                bsStyle: "primary",
                                disabled: !isToolbarEnabled,
                                onClick: () => onToggleCardPreview()
                            }
                        ]}/>
                </div>
            }>
            {isSettingsEnabled && <Settings
                items={settingsItems}
                onToggleSettings={onToggleSettings}
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
