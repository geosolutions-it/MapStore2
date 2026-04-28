/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { isString } from 'lodash';

import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import Spinner from '../../../components/layout/Spinner';

import './ProjectionRemoteSuggestions.less';

const GlyphiconWithTooltip = tooltip(Glyphicon);

const getRowIconAndTitle = ({ isAdded, isLoading, isFailed, addedTitle, loadingTitle, failedTitle, failedError }) => {
    if (isAdded) {
        return { icon: <Glyphicon glyph="ok" />, title: addedTitle };
    }
    if (isLoading) {
        return { icon: <Spinner />, title: loadingTitle };
    }
    if (isFailed) {
        const tooltipText = !failedError
            ? failedTitle
            : failedTitle
                ? <><Message msgId={failedTitle} />{': '}{failedError}</>
                : failedError;
        return {
            icon: <GlyphiconWithTooltip glyph="exclamation-sign" tooltip={tooltipText} />,
            title: undefined
        };
    }
    return { icon: <Glyphicon glyph="plus" />, title: undefined };
};

const SuggestionRow = ({
    value,
    label,
    onPick,
    isAdded,
    isLoading,
    isFailed,
    failedError,
    addedTitle,
    loadingTitle,
    failedTitle
}) => {
    // Added rows: green check, no action.
    // Loading rows: spinner, no action (in flight).
    // Failed rows: red warning + retry on click.
    // Default: plus icon, click to add.
    const isInteractive = !isAdded && !isLoading;
    const handleActivate = () => {
        if (!isInteractive) return;
        onPick(value);
    };
    const { icon, title } = getRowIconAndTitle({
        isAdded, isLoading, isFailed, addedTitle, loadingTitle, failedTitle, failedError
    });
    const className = [
        'ms-crs-popover-suggestion',
        isInteractive ? 'is-interactive' : '',
        isAdded ? 'is-added' : '',
        isLoading ? 'is-loading' : '',
        isFailed ? 'is-failed' : ''
    ].filter(Boolean).join(' ');
    return (
        <div
            role="option"
            aria-selected={isAdded}
            aria-disabled={!isInteractive}
            tabIndex={isInteractive ? 0 : -1}
            title={title}
            className={className}
            onClick={handleActivate}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleActivate();
                }
            }}
        >
            <span className="ms-crs-popover-suggestion-icon">{icon}</span>
            <span className="ms-crs-popover-suggestion-label">{label}</span>
            {label !== value && (
                <span className="ms-crs-popover-suggestion-code">{value}</span>
            )}
        </div>
    );
};

const LoadMoreButton = ({ onClick }) => (
    <button
        type="button"
        className="ms-crs-popover-load-more"
        onClick={onClick}
    >
        <Message msgId="crsSelector.loadMore" />
    </button>
);

export const formatCRSItem = function(item) {
    const { id, label } = item;
    const key = id.toLowerCase().replace(':', '');
    const finalLabel = label && isString(label) && label.trim() ? label : id;
    return { key, value: id, label: finalLabel };
};

/**
 * Floating popover that lists remote search suggestions. Designed to be
 * anchored under the unified search input.
 *  - Each row is "thin" (id only): remote items don't carry extents until
 *    they are committed via `onPick`, after which they are added to the
 *    Configured list with full info.
 *  - The popover hosts its own scroll container plus a "Load more" button
 *    so that long result sets do not push the surrounding dialog.
 */
export const ProjectionRemoteSuggestions = ({
    suggestions,
    addedCodes,
    loadingCodes,
    failedCodes,
    loading,
    total,
    canLoadMore,
    onLoadMore,
    onPick,
    addedTitle,
    loadingTitle,
    failedTitle
}) => {
    const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
    const failedMap = (failedCodes && typeof failedCodes === 'object') ? failedCodes : {};
    return (
        <div className="ms-crs-popover" role="listbox">
            <div className="ms-crs-popover-header">
                <Message
                    msgId="crsSelector.remoteSuggestionsHeader"
                    msgParams={{
                        // Stringify because react-intl 2.3's IntlMessageFormat
                        // treats numeric 0 as a missing arg in plain `{name}`
                        // placeholders, rendering it as an empty string.
                        shown: String(safeSuggestions.length),
                        total: String(total ?? 0)
                    }}
                />
            </div>
            <div className="ms-crs-popover-body">
                {safeSuggestions.length === 0 && !loading && (
                    <div className="ms-crs-popover-empty">
                        <Message msgId="crsSelector.noRemoteResults" />
                    </div>
                )}
                {safeSuggestions.map((crsItem) => {
                    const { key, value, label } = formatCRSItem(crsItem);
                    const isFailed = Object.prototype.hasOwnProperty.call(failedMap, value);
                    return (
                        <SuggestionRow
                            key={key}
                            value={value}
                            label={label}
                            onPick={onPick}
                            isAdded={addedCodes.has(value)}
                            isLoading={loadingCodes.has(value)}
                            isFailed={isFailed}
                            failedError={isFailed ? failedMap[value] : undefined}
                            addedTitle={addedTitle}
                            loadingTitle={loadingTitle}
                            failedTitle={failedTitle}
                        />
                    );
                })}
                {loading && (
                    <div className="ms-crs-popover-loading">
                        <Spinner />
                    </div>
                )}
            </div>
            {canLoadMore && !loading && safeSuggestions.length > 0 && (
                <LoadMoreButton onClick={onLoadMore} />
            )}
        </div>
    );
};
