/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import { Glyphicon } from 'react-bootstrap';
import SideCard from '../../misc/cardgrids/SideCard';

export default ({styles = [], selectedStyles = [], onSelectionChange = () => {}, className = ""}) => {
    return (<span>
        {styles.map((r, idx) => {
            const isSelected = selectedStyles.filter(st => st === r.name).length > 0;
            return (
                <div key={idx}>
                    <SideCard
                        preview={<Glyphicon glyph={r.preview || 'geoserver'} />}
                        className={`ms-sm ${isSelected ? 'ms-selected' : ''} ${className}`}
                        title={r.title}
                        description={''}
                        caption={r._abstract || ''}
                        onClick={() => {
                            const newSelection = isSelected && selectedStyles.filter( s => s !== r.name) || selectedStyles.concat(r.name);
                            onSelectionChange(newSelection);
                        }}/>
                </div>
            );
        })}
    </span>);
};
