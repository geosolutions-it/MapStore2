import React, { useRef, useState } from 'react';
import { Button, Dropdown, Glyphicon, MenuItem } from 'react-bootstrap';
import Message from '../I18N/Message';
import withConfirm from '../misc/withConfirm';
import FlexBox from '../layout/FlexBox';
import useCheckScroll from './hooks/useCheckScroll';

const WithConfirmButton = withConfirm(MenuItem);

const ViewActions = ({ handleSelect, isSelected, id, color, name, onRemove, onMove, canDelete, onConfigure, canMoveLeft, canMoveRight, canEdit, onLayoutViewSelected }) => {
    const [position, setPosition] = useState({ left: 0, bottom: 0 });
    const toggleBtnRef = useRef(null);

    const handleToggleClick = (e) => {
        e.stopPropagation();
        if (toggleBtnRef.current) {
            const rect = toggleBtnRef.current.getBoundingClientRect();
            setPosition({
                left: rect.left,
                bottom: window.innerHeight - rect.top
            });
        }
        onLayoutViewSelected(id);
    };

    return (
        <FlexBox
            gap="sm"
            classNames={["_padding-sm", "layout-views", isSelected ? "is-selected" : "", "_relative"]}
            onClick={() => handleSelect(id)}
            style={{ borderBottom: `2px solid ${color}` }}
        >
            <p>{name}</p>
            {canEdit && (
                <>
                    <Dropdown dropup bsStyle="default" id="split-button-dropup-pull-right">
                        <Dropdown.Toggle
                            onClick={handleToggleClick}
                            noCaret
                            className="square-button-md dashboard-view-actions _relative"
                        >
                            <div ref={toggleBtnRef}>
                                <Glyphicon  glyph="option-vertical" />
                            </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="_fixed" style={{ left: `${position.left}px`, bottom: `${position.bottom}px` }}>
                            <WithConfirmButton
                                confirmTitle={<Message msgId="dashboard.view.removeConfirmTitle" />}
                                confirmContent={<Message msgId="dashboard.view.removeConfirmContent" />}
                                onClick={() => onRemove(id)}
                                disabled={!canDelete}
                            >
                                <Glyphicon glyph="trash" />
                                <Message msgId="dashboard.view.delete" />
                            </WithConfirmButton>
                            <MenuItem
                                onClick={() => {
                                    onConfigure();
                                }}
                            >
                                <Glyphicon glyph="cog" />
                                <Message msgId="dashboard.view.configure" />
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    onMove(id, 'right');
                                }}
                                disabled={!canMoveRight}
                            >
                                <Glyphicon glyph="arrow-right" />
                                <Message msgId="dashboard.view.moveRight" />
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    onMove(id, 'left');
                                }}
                                disabled={!canMoveLeft}
                            >
                                <Glyphicon glyph="arrow-left" />
                                <Message msgId="dashboard.view.moveLeft" />
                            </MenuItem>
                        </Dropdown.Menu>
                    </Dropdown>
                </>
            )}
        </FlexBox>
    );
};

const ViewSwitcher = ({ layouts = [], selectedLayoutId, onSelect, onAdd, onRemove, onMove, onConfigure, canEdit, onLayoutViewSelected }) => {
    const handleSelect = (id) => {
        onSelect?.(id);
    };

    const [scrollRef, showButtons, isLeftDisabled, isRightDisabled, scroll] = useCheckScroll({ data: layouts });

    return (
        <FlexBox gap="xs" centerChildrenVertically className="_margin-tb-xs _margin-r-xs view-switcher-container">
            {canEdit && (
                <Button
                    onClick={onAdd}
                    className="square-button-md _margin-l-xs"
                    title="Add a layout view to the dashboard"
                >
                    <Glyphicon glyph="plus" />
                </Button>
            )}

            {/* Layouts Tabs */}
            <div ref={scrollRef} className="_overflow-auto _fill view-switcher-tabs">
                <FlexBox centerChildrenVertically className="">
                    {layouts.map((layout, idx) => {
                        const id = layout.id || idx + 1;
                        return (
                            <ViewActions
                                key={id}
                                id={id}
                                name={layout.name}
                                color={layout.color}
                                handleSelect={handleSelect}
                                isSelected={selectedLayoutId === id}
                                onRemove={onRemove}
                                onMove={onMove}
                                onConfigure={onConfigure}
                                canDelete={layouts.length > 1}
                                canMoveRight={idx !== layouts.length - 1}
                                canMoveLeft={idx !== 0}
                                canEdit={canEdit}
                                onLayoutViewSelected={onLayoutViewSelected}
                            />
                        );
                    })}
                </FlexBox>
            </div>
            {showButtons && (
                <FlexBox gap="xs" centerChildrenVertically className="view-scroll-buttons">
                    <Button
                        className="square-button-md"
                        bsStyle="primary"
                        onClick={() => scroll("left")}
                        disabled={isLeftDisabled}
                        title="Scroll left"
                    >
                        <Glyphicon glyph="chevron-left" />
                    </Button>
                    <Button
                        className="square-button-md"
                        bsStyle="primary"
                        onClick={() => scroll("right")}
                        disabled={isRightDisabled}
                        title="Scroll right"
                    >
                        <Glyphicon glyph="chevron-right" />
                    </Button>
                </FlexBox>
            )}
        </FlexBox>
    );
};

export default ViewSwitcher;
