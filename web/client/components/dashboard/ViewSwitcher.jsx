import React from 'react';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import Message from '../I18N/Message';
import "./dashboard.css";
import withConfirm from '../misc/withConfirm';

const WithConfirmButton = withConfirm(MenuItem);

const ViewActions = ({ handleSelect, isSelected, id, color, name, onRemove, onMove, canDelete, onConfigure, canMoveLeft, canMoveRight }) => {
    return (
        <div
            className="_padding-sm ms-flex-box _flex _flex-gap-sm"
            onClick={() => handleSelect(id)}
            style={{
                cursor: 'pointer',
                background: isSelected ? '#e3e3e3' : '#fff',
                border: '1px solid #e3e3e3',
                borderBottom: `2px solid ${color}`,
                height: '40px'
            }}
        >
            <p>{name}</p>
            <DropdownButton
                noCaret
                dropup
                title={<Glyphicon glyph="chevron-down" />}
                bsStyle="default"
                className="square-button-md dashboard-view-actions"
                id="split-button-dropup-pull-right"
            >
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
            </DropdownButton>
        </div>
    );
};

const ViewSwitcher = ({ layouts = [], selectedLayoutId, onSelect, onAdd, onRemove, onMove, onConfigure }) => {
    const handleSelect = (id) => {
        onSelect?.(id);
    };

    return (
        <div
            className="ms-flex-box _flex _flex-gap-sm _padding-xs _flex-center-v _margin-xs"
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '40px',
                width: '100%',
                borderTop: '1px solid #e3e3e3'
            }}
        >
            {/* Add icon */}
            <button
                onClick={onAdd}
                className="square-btn"
                title="Add new view"
            >
                <Glyphicon glyph="plus" />
            </button>

            {/* Layouts Tabs */}
            <div className="ms-flex-box _flex _flex-center-v">
                {layouts.map((layout, idx) => {
                    const id = layout.id || idx + 1;
                    return (
                        <ViewActions
                            key={id}
                            id={id}
                            name={layout.name || `View ${idx}`}
                            color={layout.color}
                            handleSelect={handleSelect}
                            isSelected={selectedLayoutId === id}
                            onRemove={onRemove}
                            onMove={onMove}
                            onConfigure={onConfigure}
                            canDelete={layouts.length > 1}
                            canMoveRight={idx !== layouts.length - 1}
                            canMoveLeft={idx !== 0}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ViewSwitcher;
