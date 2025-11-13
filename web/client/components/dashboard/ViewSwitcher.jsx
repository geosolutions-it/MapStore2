import React, { useRef, useState } from 'react';
import { Button, Dropdown, Glyphicon, MenuItem } from 'react-bootstrap';
import Message from '../I18N/Message';
import withConfirm from '../misc/withConfirm';
import FlexBox from '../layout/FlexBox';
import useCheckScroll from './hooks/useCheckScroll';

const WithConfirmButton = withConfirm(MenuItem);

const View = ({ handleSelect, isSelected, id, color, name, onRemove, onMove, canDelete, onConfigure, canMoveLeft, canMoveRight, canEdit }) => {
    const [position, setPosition] = useState({ left: 0, bottom: 0, right: 0 });
    const toggleBtnRef = useRef(null);

    const handleToggleClick = () => {
        handleSelect(id);
        if (toggleBtnRef.current) {
            const rect = toggleBtnRef.current.getBoundingClientRect();
            // align to right if there is space, otherwise align to left
            if (window.innerWidth - rect.right < 200) {
                setPosition({
                    right: window.innerWidth - rect.right - 4,
                    bottom: window.innerHeight - rect.top + 10,
                    left: 'auto'
                });
            } else {
                setPosition({
                    left: rect.left - 4,
                    bottom: window.innerHeight - rect.top + 10,
                    right: 'auto'
                });
            }
        }
    };

    return (
        <Dropdown
            dropup
            bsStyle="default"
            id={id}
            className={`${isSelected ? "is-selected " : ""}ms-layout-view`}
            style={{ borderBottom: `2px solid ${color}` }}
        >
            <Button onClick={() => handleSelect(id)} bsStyle="default">
                {name}
            </Button>
            {canEdit && (
                <Dropdown.Toggle onClick={handleToggleClick} noCaret>
                    <div ref={toggleBtnRef}>
                        <Glyphicon glyph="option-vertical" />
                    </div>
                </Dropdown.Toggle>
            )}
            <Dropdown.Menu className="_fixed" style={{ ...position }}>
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
        </Dropdown>);
};

const ViewSwitcher = ({ layouts = [], selectedLayoutId, onSelect, onAdd, onRemove, onMove, onConfigure, canEdit }) => {
    const handleSelect = (id) => {
        onSelect?.(id);
    };

    const [scrollRef, showButtons, isLeftDisabled, isRightDisabled, scroll] = useCheckScroll({ data: layouts });

    return (
        <FlexBox gap="xs" centerChildrenVertically className="view-switcher-container">
            {canEdit && (
                <Button
                    onClick={onAdd}
                    className="square-button-md _margin-l-xs _margin-tb-xs"
                    title="Add a layout view to the dashboard"
                >
                    <Glyphicon glyph="plus" />
                </Button>
            )}

            {/* Layouts Tabs */}
            <FlexBox centerChildrenVertically ref={scrollRef} className="_overflow-auto _fill view-switcher-tabs">
                {layouts.map((layout, idx) => {
                    const id = layout.id || idx + 1;
                    return (
                        <View
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
                        />
                    );
                })}
            </FlexBox>
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
