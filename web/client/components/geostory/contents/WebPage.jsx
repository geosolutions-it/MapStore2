import React from 'react';
import { compose, branch, withProps } from 'recompose';
import { connect } from "react-redux";
import { createSelector } from 'reselect';
import { resourcesSelector } from '../../../selectors/geostory';
import emptyState from '../../misc/enhancers/emptyState';
import { find } from 'lodash';

const WebPage = ({ src, width, height }) => (
    <div
        className="ms-webpage-wrapper"
        width={width}
        height={height}
    >
        <iframe src={src} />
    </div>
);

export default compose(
    branch(
        ({resourceId}) => resourceId,
        compose(
            connect(createSelector(resourcesSelector, (resources) => ({resources}))),
            withProps(({resources, resourceId: id}) => (find(resources, { id }) || {}).data)
        ),
        emptyState(
            ({src = "", width, height} = {}) => (!src || !width || !height),
            () => ({ glyph: "code" })
        )
    )
)(WebPage);
