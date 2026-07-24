/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from '../../misc/Button';
import SwitchButton from '../../misc/switch/SwitchButton';
import Message from '../../I18N/Message';

const tip = (id, msgId) => (
    <Tooltip id={id}><Message msgId={msgId} /></Tooltip>
);

const ToolButton = ({ glyph, tooltipKey, tooltipId, disabled, onClick, className = 'ms-filter-card-tool-btn', placement = 'top', children }) => (
    <OverlayTrigger placement={placement} overlay={tip(tooltipId, tooltipKey)}>
        {children ||
        (
            <Button
                bsSize="xsmall"
                bsStyle="link"
                disabled={disabled}
                onClick={(e) => { e.stopPropagation(); if (!disabled) { onClick(); } }}
                className={className}
            >
                <Glyphicon glyph={glyph} />
            </Button>
        )}
    </OverlayTrigger>
);

/**
 * Per-filter card toolbar shown in the FilterView header. Supports:
 * - collapse / expand the filter body
 * - enable / disable the filter (skipped from interaction CQL composition)
 */
const FilterItemToolbar = ({
    filterData,
    collapsed = false,
    onClick,
    showCollapseToggle = false,
    showDisableToggle = false
}) => {
    if (!showCollapseToggle && !showDisableToggle) {
        return null;
    }

    const enabled = !filterData?.disabled;

    return (
        <div
            className="ms-filter-card-toolbar"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={(e) => e.stopPropagation()}
        >
            {showDisableToggle && (
                <ToolButton
                    glyph=""
                    tooltipKey={`widgets.filterWidget.${enabled ? 'disableFilter' : 'enableFilter'}`}
                    tooltipId={`filter-disable-${filterData?.id}`}
                >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <SwitchButton
                            checked={enabled}
                            onChange={(checked) => onClick(!checked)}
                            className="mapstore-switch-btn-xs ms-filter-disable-toggle"
                        />
                    </span>
                </ToolButton>
            )}
            {showCollapseToggle && (
                <ToolButton
                    glyph={collapsed ? 'next' : 'bottom'}
                    tooltipKey={`widgets.filterWidget.${collapsed ? 'expandFilter' : 'collapseFilter'}`}
                    tooltipId={`filter-collapse-${filterData?.id}`}
                    onClick={onClick}
                    className="ms-filter-collapse-toggle"
                />
            )}
        </div>
    );
};

FilterItemToolbar.propTypes = {
    filterData: PropTypes.object,
    collapsed: PropTypes.bool,
    onToggleCollapse: PropTypes.func,
    onToggleDisabled: PropTypes.func
};

export default FilterItemToolbar;
