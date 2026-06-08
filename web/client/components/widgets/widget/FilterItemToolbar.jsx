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

const ToolButton = ({ glyph, tooltipKey, tooltipId, disabled, onClick, className = 'ms-filter-card-tool-btn' }) => (
    <OverlayTrigger placement="top" overlay={tip(tooltipId, tooltipKey)}>
        <Button
            bsSize="xsmall"
            bsStyle="link"
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); if (!disabled) { onClick(); } }}
            className={className}
        >
            <Glyphicon glyph={glyph} />
        </Button>
    </OverlayTrigger>
);

export { ToolButton };

ToolButton.propTypes = {
    glyph: PropTypes.string.isRequired,
    tooltipKey: PropTypes.string.isRequired,
    tooltipId: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
};

/**
 * Per-filter card toolbar shown in the FilterView header. Supports:
 * - collapse / expand the filter body
 * - enable / disable the filter (skipped from interaction CQL composition)
 */
const FilterItemToolbar = ({
    filterData,
    collapsed = false,
    onToggleCollapse,
    onToggleDisabled
}) => {
    const enabled = !filterData?.disabled;

    return (
        <div
            className="ms-filter-card-toolbar"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={(e) => e.stopPropagation()}
        >
            {onToggleDisabled && (
                <OverlayTrigger
                    placement="top"
                    overlay={tip(`fitr-en-${filterData?.id}`, enabled
                        ? 'widgets.filterWidget.disableFilter'
                        : 'widgets.filterWidget.enableFilter')}
                >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <SwitchButton
                            checked={enabled}
                            onChange={(checked) => onToggleDisabled(!checked)}
                            className="mapstore-switch-btn-xs"
                        />
                    </span>
                </OverlayTrigger>
            )}
            {onToggleCollapse && (
                <ToolButton
                    glyph={collapsed ? 'chevron-right' : 'chevron-down'}
                    tooltipKey={collapsed
                        ? 'widgets.filterWidget.expandFilter'
                        : 'widgets.filterWidget.collapseFilter'}
                    tooltipId={`flt-c-${filterData?.id}`}
                    onClick={onToggleCollapse}
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
