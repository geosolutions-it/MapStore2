/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from '../../misc/Button';
import SwitchButton from '../../misc/switch/SwitchButton';
import Message from '../../I18N/Message';
import { TARGET_TYPES } from '../../../utils/InteractionUtils';
import { getWidgetByDependencyPath } from '../../../utils/WidgetsUtils';

const tip = (id, msgId) => (
    <Tooltip id={id}><Message msgId={msgId} /></Tooltip>
);

const ToolButton = ({ glyph, tooltipKey, tooltipElement, tooltipId, disabled, onClick, className = 'ms-filter-card-tool-btn' }) => (
    <OverlayTrigger placement="top" overlay={tooltipElement || tip(tooltipId, tooltipKey)}>
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
    tooltipKey: PropTypes.string,
    tooltipElement: PropTypes.node,
    tooltipId: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
};

/**
 * Per-filter card toolbar shown in the FilterView header. Supports:
 * - collapse / expand the filter body
 * - enable / disable the filter (skipped from interaction CQL composition)
 * - manual zoom to the filtered extent (only when a plugged zoom-to interaction is in manual mode)
 */
const FilterItemToolbar = ({
    filterData,
    collapsed = false,
    interactions = [],
    widgets = [],
    onToggleCollapse,
    onToggleDisabled,
    onZoomToFilterExtent
}) => {
    const enabled = !filterData?.disabled;
    const zoomToInteractions = useMemo(() => (interactions || [])
        .filter(interaction =>
            interaction?.plugged === true
            && interaction?.targetType === TARGET_TYPES.APPLY_ZOOM_TO
            && interaction?.configuration?.autoZoom !== true
        ),
    [interactions]);
    const zoomToMapNames = useMemo(() => zoomToInteractions
        .map(i => getWidgetByDependencyPath(i?.target?.nodePath, widgets)?.title)
        .filter(Boolean),
    [zoomToInteractions, widgets]);
    const showZoomButton = zoomToInteractions.length > 0;

    return (
        <div
            className="ms-filter-card-toolbar"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={(e) => e.stopPropagation()}
        >
            {showZoomButton && onZoomToFilterExtent && (
                <ToolButton
                    glyph="zoom-to"
                    tooltipElement={
                        <Tooltip id={`filter-zoom-${filterData?.id}`}>
                            <Message msgId="widgets.filterWidget.zoomToFilterExtent" msgParams={{ names: zoomToMapNames.length ? `: ${zoomToMapNames.join(', ')}` : ''}} />
                        </Tooltip>
                    }
                    disabled={!enabled}
                    onClick={onZoomToFilterExtent}
                />
            )}
            {onToggleDisabled && (
                <OverlayTrigger
                    placement="top"
                    overlay={tip(`filter-en-${filterData?.id}`, enabled
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
                    glyph={collapsed ? 'next' : 'bottom'}
                    tooltipKey={collapsed
                        ? 'widgets.filterWidget.expandFilter'
                        : 'widgets.filterWidget.collapseFilter'}
                    tooltipId={`filter-collapse-${filterData?.id}`}
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
    onToggleDisabled: PropTypes.func,
    onZoomToFilterExtent: PropTypes.func
};

export default FilterItemToolbar;
