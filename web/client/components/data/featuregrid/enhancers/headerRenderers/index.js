import React from 'react';
import LocalizedHeaderRenderer from './LocalizedHeaderRenderer';

// NOTE: the headerRenderer must be an Element, not a component (it is internally cloned by react-data-grid)

/**
 * Returns the header renderer for the column
 * @returns {React.Element} the header renderer
 */
export const getHeaderRenderer = () => <LocalizedHeaderRenderer />;
