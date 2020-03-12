/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { isEqual } from 'lodash';
import { Glyphicon } from 'react-bootstrap';
import Select from 'react-select';

import defaultFilterOptions from 'react-select/lib/utils/defaultFilterOptions';
import defaultMenuRenderer from 'react-select/lib/utils/defaultMenuRenderer';

export default ({
    nextPageIcon = 'chevron-right',
    prevPageIcon = 'chevron-left',
    pagination = {
        paginated: true,
        firstPage: false,
        lastPage: false,
        loadPrevPage: () => {},
        loadNextPage: () => {}
    },
    applyOptionsFilter = false,
    valueComparator = isEqual,
    ...selectProps
}) => {
    const selectOptionsDiv = React.useRef();
    const curSelectValue = React.useRef();

    // react-select resets input value if this.props.value !== nextProps.value
    // this is a workaround for that
    React.useEffect(() => {
        if (curSelectValue.current === undefined) {
            curSelectValue.current = selectProps.value;
        } else if (!valueComparator(curSelectValue.current, selectProps.value)) {
            curSelectValue.current = selectProps.value;
        }
    });

    return (
        <Select
            {...selectProps}
            value={curSelectValue.current || selectProps.value}
            filterOptions={(options, filter, currentValues, props) => selectProps.filterOptions ?
                selectProps.filterOptions(options, filter, currentValues, props) :
                defaultFilterOptions(
                    options,
                    applyOptionsFilter ? filter : '',
                    currentValues,
                    props
                )
            }
            menuRenderer={(props) => {
                const { paginated, firstPage, lastPage, loadPrevPage = () => {}, loadNextPage = () => {} } = pagination;

                const renderedOptions = selectProps.menuRenderer ?
                    selectProps.menuRenderer(props) :
                    defaultMenuRenderer(props);

                return (<>
                    <div ref={selectOptionsDiv} className="paged-select-options">
                        {renderedOptions}
                    </div>
                    {paginated && !(firstPage && lastPage) &&
                        <div className="paged-select-bar-container">
                            <div className="paged-select-bar">
                                {!firstPage && <Glyphicon className="prev-page-button" glyph={prevPageIcon} onClick={() => {
                                    if (selectOptionsDiv.current) {
                                        selectOptionsDiv.current.scrollTop = 0;
                                    }
                                    loadPrevPage();
                                }}/>}
                                {!lastPage && <Glyphicon className="next-page-button" glyph={nextPageIcon} onClick={() => {
                                    if (selectOptionsDiv.current) {
                                        selectOptionsDiv.current.scrollTop = 0;
                                    }
                                    loadNextPage();
                                }}/>}
                            </div>
                        </div>}
                </>);
            }}/>
    );
};
