import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import ReactDock from 'react-dock';
import { getDockSize } from '../../../selectors/featuregrid';
import { mapLayoutValuesSelector } from '../../../selectors/maplayout';
import BasicSpinner from '../../misc/spinners/BasicSpinner/BasicSpinner';

export const getDockProps = (open) => ({
    dimMode: "none",
    defaultSize: 0.35,
    fluid: true,
    isVisible: open,
    maxDockSize: 0.7,
    minDockSize: 0.1,
    position: "bottom",
    setDockSize: () => { },
    zIndex: 1060
});

const Dock = connect(createSelector(
    getDockSize,
    state => mapLayoutValuesSelector(state, { transform: true }),
    (size, dockStyle) => ({
        size,
        dockStyle
    })
)
)(ReactDock);

const FeatureEditorFallback = (props) => {
    const dockProps = getDockProps(props.open);
    return (
        <Dock {...dockProps} onSizeChange={size => { props.onSizeChange(size, dockProps); }}>
            <div className="feature-editor-fallback-container">
                <BasicSpinner sSize="sp-big" />
            </div>
        </Dock>
    );
};

export default connect(
    createSelector([state => state?.featuregrid?.open], (open) => ({ open }))
)(FeatureEditorFallback);
