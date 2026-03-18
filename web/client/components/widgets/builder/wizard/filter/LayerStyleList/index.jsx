/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Alert, Glyphicon, ListGroup, ListGroupItem, Button, FormControl, InputGroup, Popover } from 'react-bootstrap';

import Overlay from '../../../../../misc/Overlay';
import Filter from '../../../../../misc/Filter';
import Message from '../../../../../I18N/Message';
import './style.less';
import { getMessageById } from '../../../../../../utils/LocaleUtils';
import withLayerStyles from './enhancers/withLayerStyles';

const LayerStylesList = ({
    layer,
    selectedStyle,
    onSelect,
    styles = [],
    stylesLoading = false,
    stylesError = null
}, context) => {
    const [filterText, setFilterText] = useState('');
    const [showPopover, setShowPopover] = useState(false);

    if (!layer || layer.type !== 'wms') {
        return null;
    }

    // Filter styles based on filterText
    const filteredStyles = useMemo(() => {
        if (!filterText) {
            return styles;
        }
        const lowerFilter = filterText.toLowerCase();
        return styles.filter(style => {
            const title = (style.title || style.name || '').toLowerCase();
            const name = (style.name || '').toLowerCase();
            return title.includes(lowerFilter) || name.includes(lowerFilter);
        });
    }, [styles, filterText]);

    const loading = stylesLoading;
    const error = stylesError;

    const messages = context?.messages || {};
    const getStyleLabel = (style) => {
        if (!style) return getMessageById(messages, 'widgets.filterWidget.selectStylePlaceholder');
        if (typeof style === 'string') {
            const foundStyle = styles.find(s => s.name === style);
            return foundStyle ? (foundStyle.title || foundStyle.name) : style;
        }
        return style.title || style.name || 'Unnamed Style';
    };

    const handleStyleClick = (style) => {
        if (onSelect) {
            onSelect(style);
        }
        setShowPopover(false);
    };

    const handleClose = () => {
        setFilterText(''); // Clear filter
        setShowPopover(false);
    };

    const displayLabel = getStyleLabel(selectedStyle);

    const popoverContent = (
        <div className="ms-layer-styles-popover-content">
            <Filter
                filterText={filterText}
                filterPlaceholder={getMessageById(messages, 'widgets.filterWidget.filterStylesPlaceholder')}
                onFilter={setFilterText}
            />
            {loading ? (
                <div className="ms-layer-styles-loading">
                    <Glyphicon glyph="refresh" className="spinning" /> Loading styles...
                </div>
            ) : error ? (
                <Alert bsStyle="danger">
                    <strong>Error:</strong> {error}
                </Alert>
            ) : filteredStyles.length === 0 ? (
                <div className="ms-layer-styles-empty">
                    {filterText ? 'No styles match your filter.' : 'No styles available for this layer.'}
                </div>
            ) : (
                <ListGroup className="ms-layer-styles-items">
                    {filteredStyles.map((style, index) => {
                        const label = getStyleLabel(style);
                        const isSelected = selectedStyle && (
                            (typeof selectedStyle === 'string' && selectedStyle === style.name) ||
                            (typeof selectedStyle === 'object' && selectedStyle.name === style.name)
                        );
                        return (
                            <ListGroupItem
                                key={style.name || index}
                                active={isSelected}
                                onClick={() => handleStyleClick(style)}
                                className="ms-layer-style-item"
                            >
                                {label}
                            </ListGroupItem>
                        );
                    })}
                </ListGroup>
            )}
        </div>
    );

    const triggerButtonRef = useRef(null);

    return (
        <div className="ms-layer-styles-list" style={{ width: 135 }}>
            <InputGroup style={{ width: '100%' }}>
                <FormControl
                    type="text"
                    value={displayLabel}
                    placeholder={getMessageById(messages, 'widgets.filterWidget.selectStylePlaceholder')}
                    readOnly
                    onClick={() => setShowPopover(true)}
                    style={{ cursor: 'pointer' }}
                />
                <InputGroup.Button>
                    <Button
                        ref={triggerButtonRef}
                        onClick={() => setShowPopover(!showPopover)}
                    >
                        <Glyphicon glyph="chevron-down" />
                    </Button>
                </InputGroup.Button>
            </InputGroup>
            <Overlay
                show={showPopover}
                target={() => triggerButtonRef.current}
                placement="top"
                rootClose
                onHide={handleClose}
            >
                <Popover
                    id="layer-styles-popover"
                    title={<Message msgId="widgets.filterWidget.selectLayerStyle" />}
                    className="ms-layer-styles-popover"
                >
                    {popoverContent}
                </Popover>
            </Overlay>
        </div>
    );
};

LayerStylesList.propTypes = {
    layer: PropTypes.object,
    selectedStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onSelect: PropTypes.func,
    styles: PropTypes.array,
    stylesLoading: PropTypes.bool,
    stylesError: PropTypes.string
};

LayerStylesList.contextTypes = {
    messages: PropTypes.object
};

LayerStylesList.defaultProps = {
    layer: null,
    selectedStyle: null,
    onSelect: () => {},
    styles: [],
    stylesLoading: false,
    stylesError: null
};

const EnhancedLayerStylesList = withLayerStyles(LayerStylesList);

// Export both the enhanced component (default) and base component for testing
export { LayerStylesList };
export default EnhancedLayerStylesList;
