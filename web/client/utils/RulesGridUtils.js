/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const EMPTY_ROW = {id: "empty_row", get: () => undefined};
const getPageIdx = (i, size) => Math.floor(i / size);
const getRow = (i, pages = {}, size) => {
    const pIdx = getPageIdx(i, size);
    return pages[pIdx] && pages[pIdx][i - (pIdx * size)] || EMPTY_ROW;
};

/**
 * Sort old pages by index distance from the average needed pages
 * @param {numeric} avgIdx The average page index
 * @param {array} [pages=[]] old pages indexes
 * @param {numeric} firstIdx index of the first needed page
 * @param {numeric} lastIdx  index of the latest needed page
 * @returns {array} Array of old page indexes ordered by distance from requested pages
 */
const getIdxFarthestEl = (avgIdx, pages = [], firstIdx, lastIdx) => {
    return pages.map(val => firstIdx <= val && val <= lastIdx ? 0 : Math.abs(val - avgIdx)).map((distance, idx) => ({idx: pages[idx], distance})).sort((a, b) => a.distance - b.distance).reverse().map(({idx}) => idx);
};


module.exports = {
    getPageIdx,
    getRow,
    getPagesToLoad: (startPage, endPage, pages) => {
        let needPages = [];
        for (let i = startPage; i <= endPage; i++) {
            if (!pages[i]) {
                needPages.push(i);
            }
        }
        return needPages;
    },
    /**
     * updates the pages and the rules of the request to support virtual scroll.
     * This is virtual scroll with support for
     * @param {object} newPages An object with page index as key and an array of rules ad value
     * @param {object} requestOptions contains startPage and endPage needed.
     * @param {object} oldPages pages previously loaded
     * @param {numeric} maxStoredPages. the max number of page to cache, .
     *
     */
    updatePages: (newPages = {}, {startPage, endPage, pages: oldPages}, maxStoredPages = 5) => {
        const newPageLength = Object.keys(newPages).length;
        const oldPageLength = Object.keys(oldPages).length;
        // Cached page should be less than the max of maxStoredPages or the number of page needed to fill the visible are of the grid
        const nSpaces = oldPageLength + newPageLength - Math.max(maxStoredPages, (endPage - startPage + 1));
        let tempPages = {...oldPages};
        if (nSpaces > 0) {
            // remove farhest pages
            const pages = Object.keys(oldPages);
            // Remove the farthest page from last loaded pages
            const averageIdx = startPage + endPage / 2;
            const farthestElindexes = getIdxFarthestEl(averageIdx, pages, startPage, endPage);
            for (let i = 0; i < nSpaces; i++) {
                delete tempPages[farthestElindexes[i]];
            }
        }
        return { pages: {...tempPages, ...newPages}};
    },
    flattenPages: (pages = {}) => Object.keys(pages).reduce((rows, key) => rows.concat((pages[key] || [])), []),
    getOffsetFromTop: (row, rows) => rows.indexOf(row),
    getClosestRows: (row, rows) => {
        const idx = rows.indexOf(row);
        return {prev: rows[idx - 1], next: rows[idx + 1]};
    }
};
