/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import Message from '../../../components/I18N/Message';
import Menu from './Menu';

import Spinner from '../../../components/layout/Spinner';
import Icon from './Icon';
import Button from '../../../components/layout/Button';
import { Dropdown, MenuItem } from 'react-bootstrap';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';

const ResourcesListHeader = ({
    columns,
    metadata,
    setColumns
}) => {

    const container = useRef();
    const [selected, setSelected] = useState();

    const matchPaths = () => {
        const columnsPaths = columns.map(entry => entry.path).join(',');
        const metadataPaths = metadata.map(entry => entry.path).join(',');
        return columnsPaths === metadataPaths;
    };
    const init = useRef();
    init.current = () => {
        if (!columns?.length || !matchPaths()) {
            const total = metadata.reduce((sum, en) => sum + en.width, 0);
            setColumns(metadata.map((entry, idx) => {
                // compute the correct percentage in case the sum of metadata widths is not 100
                const width = entry.width / total * 100;
                return {
                    path: entry.path,
                    width: width,
                    right: metadata.filter((en, jdx) => jdx < idx).reduce((sum, en) => sum + (en.width / total * 100), 0),
                    left: metadata.filter((en, jdx) => jdx <= idx).reduce((sum, en) => sum + (en.width / total * 100), 0)
                };
            }));
        }
    };

    useEffect(() => {
        init.current();
    }, []);

    return (
        <FlexBox.Fill className="ms-resources-list-header" classNames={['_relative']} flexBox>
            <div className="ms-resource-card-limit"></div>
            <FlexBox.Fill
                flexBox
                classNames={['_relative']}
                centerChildrenVertically
                ref={container}
                onPointerMove={(event) => {
                    event.preventDefault();
                    if (selected !== undefined && container.current) {
                        const containerNode = container.current;
                        const column = columns[selected];
                        const nextColumn = columns[selected + 1];
                        const rect = containerNode.getBoundingClientRect();
                        const newLeft = Math.round(((event.clientX - rect.x) / rect.width) * 100);
                        if (newLeft > column.right && newLeft < nextColumn.left) {
                            setColumns(columns
                                .map((prevColumn, idx) =>
                                    idx === selected
                                        ? { ...prevColumn, width: newLeft - column.right }
                                        : (selected + 1) === idx
                                            ? { ...prevColumn, width: prevColumn.left - newLeft }
                                            : prevColumn)
                                .map((entry, idx, arr) => ({
                                    path: entry.path,
                                    width: entry.width,
                                    right: arr.filter((en, jdx) => jdx < idx).reduce((sum, en) => sum + en.width, 0),
                                    left: arr.filter((en, jdx) => jdx <= idx).reduce((sum, en) => sum + en.width, 0)
                                }))
                            );
                        }
                    }
                }}
                onPointerLeave={() => {
                    setSelected();
                }}
                onPointerUp={() => {
                    setSelected();
                }}
                onPointerDown={(event) => {
                    event.preventDefault();
                    const columnIndex = event.target.getAttribute('data-column-index');
                    if (columnIndex) {
                        setSelected(parseFloat(columnIndex));
                    }
                }}
            >
                {columns.filter((column, idx) => idx < columns.length - 1).map((column, idx) => {
                    return (<div key={column.path} data-column-index={idx} className={`ms-resources-list-header-divider${selected === idx ? ' selected' : ''}`} style={{ left: `${column.left}%` }}/>);
                })}
                {columns.map((entry) => {
                    const property = metadata.find(en => en.path === entry.path);
                    return (<Text fontSize="sm" classNames={['_padding-lr-sm']} ellipsis key={entry.path} style={{ width: `${entry.width}%` }}>
                        {property?.labelId ? <Message msgId={property.labelId}/> : null}
                    </Text>);
                })}
            </FlexBox.Fill>
            <div className="ms-resource-card-limit"></div>
        </FlexBox.Fill>
    );
};

const ResourcesMenu = forwardRef(({
    menuItems,
    style,
    totalResources,
    loading,
    hideCardLayoutButton,
    cardLayoutStyle,
    setCardLayoutStyle,
    orderConfig,
    query,
    formatHref,
    titleId,
    theme = 'main',
    menuItemsLeft = [],
    columns,
    setColumns,
    metadata
}, ref) => {

    const {
        defaultLabelId,
        options: orderOptions = [],
        variant: orderVariant,
        align: orderAlign = 'right'
    } = orderConfig || {};

    const selectedSort = orderOptions.find(({ value }) => query?.sort === value);
    function handleToggleCardLayoutStyle() {
        setCardLayoutStyle(cardLayoutStyle === 'grid' ? 'list' : 'grid');
    }

    const orderButtonNode = orderOptions.length > 0 &&
        <Dropdown pullRight={orderAlign === 'right'} id="sort-dropdown">
            <Dropdown.Toggle
                bsStyle={orderVariant || 'default'}
                bsSize="sm"
                noCaret
            >
                <Message msgId={selectedSort?.labelId || defaultLabelId} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {orderOptions.map(({ labelId, value }) => {
                    return (
                        <MenuItem
                            key={value}
                            active={value === selectedSort?.value}
                            href={formatHref({
                                query: {
                                    sort: [value]
                                },
                                replaceQuery: true
                            })}
                        >
                            <Message msgId={labelId} />
                        </MenuItem>
                    );
                })}
            </Dropdown.Menu>
        </Dropdown>;

    return (
        <FlexBox
            ref={ref}
            classNames={[
                'ms-resources-menu',
                '_sticky',
                '_corner-tl',
                `ms-${theme}-colors`,
                '_padding-tb-sm'
            ]}
            column
            gap="sm"
            style={style}
        >
            {titleId
                ? <Text fontSize="lg">
                    <Message msgId={titleId}/>
                </Text>
                : null}
            <FlexBox centerChildrenVertically gap="xs">
                <FlexBox.Fill flexBox centerChildrenVertically gap="sm">
                    {menuItemsLeft.map(({ Component, name }) => {
                        return (<Component key={name} query={query} />);
                    })}
                    {orderAlign === 'left' ? orderButtonNode : null}
                    <Text fontSize="sm" ellipsis>
                        {loading
                            ? <Spinner />
                            : <Message msgId="resourcesCatalog.resourcesFound" msgParams={{ count: totalResources }}/>}
                    </Text>
                </FlexBox.Fill>
                <Menu
                    items={menuItems}
                    containerClass={`ms-menu-list`}
                    size="md"
                    alignRight
                />
                {!hideCardLayoutButton && <Button
                    variant="default"
                    onClick={handleToggleCardLayoutStyle}
                    square
                >
                    <Icon glyph={cardLayoutStyle === 'grid' ? 'th-list' : 'th'} type="glyphicon"/>
                </Button>}
                {orderAlign === 'right' ? orderButtonNode : null}
            </FlexBox>
            {cardLayoutStyle === 'list' ? <ResourcesListHeader columns={columns} setColumns={setColumns} metadata={metadata}/> : null}
        </FlexBox>
    );
});

ResourcesMenu.defaultProps = {
    orderOptions: [
        {
            label: 'Most recent',
            labelId: 'resourcesCatalog.mostRecent',
            value: '-date'
        },
        {
            label: 'Less recent',
            labelId: 'resourcesCatalog.lessRecent',
            value: 'date'
        },
        {
            label: 'A Z',
            labelId: 'resourcesCatalog.aZ',
            value: 'title'
        },
        {
            label: 'Z A',
            labelId: 'resourcesCatalog.zA',
            value: '-title'
        },
        {
            label: 'Most popular',
            labelId: 'resourcesCatalog.mostPopular',
            value: 'popular_count'
        }
    ],
    defaultLabelId: 'resourcesCatalog.orderBy',
    formatHref: () => '#'
};

export default ResourcesMenu;
