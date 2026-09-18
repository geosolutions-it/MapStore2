
/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ResourceCard from '../ResourceCard';

describe('ResourceCard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<ResourceCard />, document.getElementById('container'));
        const resourceCard = document.querySelector('.ms-resource-card');
        expect(resourceCard).toBeTruthy();
    });
    it('should render with list layout style', () => {
        ReactDOM.render(<ResourceCard layoutCardsStyle="list" />, document.getElementById('container'));
        const resourceCard = document.querySelector('.ms-resource-card-type-list');
        expect(resourceCard).toBeTruthy();
    });

    it('should render with table layout style', () => {
        ReactDOM.render(<ResourceCard layoutCardsStyle="table" />, document.getElementById('container'));
        const resourceCard = document.querySelector('.ms-resource-card-type-table');
        expect(resourceCard).toBeTruthy();
    });

    it('should render sample list configuration with items and type array', () => {
        const metadata = [
            {
                path: 'name',
                target: 'header'
            },
            {
                path: 'users',
                separator: ';',
                items: [
                    {
                        type: 'link',
                        path: 'username',
                        hrefPath: 'userHref'
                    },
                    {
                        type: 'link',
                        hrefPath: 'iconHref',
                        icon: {
                            glyph: 'user'
                        }
                    }
                ]
            },
            {
                path: 'description',
                target: 'description'
            },
            {
                items: [
                    {
                        type: 'text',
                        label: 'Uploaded On:'
                    },
                    {
                        path: 'creation',
                        type: 'date',
                        format: 'MMMM D, YYYY'
                    }
                ]
            },
            {
                target: 'footer',
                items: [
                    {
                        type: 'text',
                        label: 'Part of'
                    },
                    {
                        path: 'partOf',
                        type: 'link',
                        hrefPath: 'partOfLink'
                    }
                ]
            }
        ];

        const data = {
            name: 'Sample Map',
            description: 'Sample description',
            creation: '2026-08-17T00:00:00.000Z',
            partOf: 'Y Dataset',
            partOfLink: '#/dataset/y',
            users: [
                {
                    username: 'user1',
                    userHref: '#/users/user1',
                    iconHref: '#/users/user1/avatar'
                },
                {
                    username: 'user2',
                    userHref: '#/users/user2',
                    iconHref: '#/users/user2/avatar'
                }
            ]
        };

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="list"
                data={data}
                metadata={metadata}
            />,
            document.getElementById('container')
        );

        const card = document.querySelector('.ms-resource-card-type-list');
        expect(card).toBeTruthy();

        // Header
        const header = document.querySelector('.ms-resource-card-body-header');
        expect(header.textContent).toContain('Sample Map');

        // Users array with separator
        const links = document.querySelectorAll('a.ms-link');
        const hrefs = Array.from(links).map(a => a.getAttribute('href'));
        expect(hrefs).toContain('#/users/user1');
        expect(hrefs).toContain('#/users/user1/avatar');
        expect(hrefs).toContain('#/users/user2');
        expect(hrefs).toContain('#/users/user2/avatar');
        expect(hrefs).toContain('#/dataset/y');

        // Check user glyph icons
        const glyphs = document.querySelectorAll('.glyphicon-user');
        expect(glyphs.length).toBe(2);

        // Description
        expect(card.textContent).toContain('Sample description');

        // Uploaded on date format
        expect(card.textContent).toContain('Uploaded On:');
        expect(card.textContent).toContain('August 17, 2026');

        // Footer
        const footer = document.querySelector('.ms-resource-card-body-footer');
        expect(footer.textContent).toContain('Part of');
        expect(footer.textContent).toContain('Y Dataset');
    });

    it('should render type: array with primitive values and separator', () => {
        const metadata = [
            {
                path: 'tags',
                type: 'array',
                separator: ', '
            }
        ];
        const data = {
            tags: ['geology', 'maps', 'satellite']
        };

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="list"
                data={data}
                metadata={metadata}
            />,
            document.getElementById('container')
        );

        const card = document.querySelector('.ms-resource-card');
        expect(card.textContent).toContain('geology, maps, satellite');
    });

    it('should add ms-resource-card-description class when target is description and layout is list', () => {
        const metadata = [
            {
                path: 'description',
                target: 'description'
            }
        ];
        const data = {
            description: 'Sample description text'
        };

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="list"
                data={data}
                metadata={metadata}
            />,
            document.getElementById('container')
        );

        const descriptionNode = document.querySelector('.ms-resource-card-description');
        expect(descriptionNode).toBeTruthy();
        expect(descriptionNode.textContent).toContain('Sample description text');
    });

    it('should render header with items template', () => {
        const metadata = [
            {
                target: 'header',
                items: [
                    {
                        path: 'title',
                        type: 'text'
                    },
                    {
                        path: 'version',
                        type: 'text',
                        separator: ' v'
                    }
                ]
            }
        ];
        const data = {
            title: 'Map Title',
            version: '2.0'
        };

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="list"
                data={data}
                metadata={metadata}
            />,
            document.getElementById('container')
        );

        const header = document.querySelector('.ms-resource-card-body-header');
        expect(header.textContent).toContain('Map Title');
        expect(header.textContent).toContain('v 2.0');
    });

    it('should resolve hrefPath and formatHref filter', () => {
        const metadata = [
            {
                path: 'category',
                type: 'link',
                filter: 'filter{category.in}'
            },
            {
                path: 'download',
                type: 'link',
                hrefPath: 'links.downloadUrl'
            }
        ];
        const data = {
            category: 'Land',
            download: 'Download Layer',
            links: {
                downloadUrl: 'http://example.com/download.zip'
            }
        };

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="list"
                data={data}
                metadata={metadata}
                formatHref={({ query }) => `#/catalog?category=${query['filter{category.in}']}`}
            />,
            document.getElementById('container')
        );

        const links = document.querySelectorAll('a.ms-link');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('href')).toBe('#/catalog?category=Land');
        expect(links[1].getAttribute('href')).toBe('http://example.com/download.zip');
    });

    it('should render image logo in metadata entry and items', () => {
        const metadata = [
            {
                items: [
                    {
                        path: 'provider',
                        image: { value: 'http://example.com/logo.png' }
                    }
                ]
            }
        ];
        const data = {
            provider: 'GeoProvider'
        };

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="list"
                data={data}
                metadata={metadata}
            />,
            document.getElementById('container')
        );

        const img = document.querySelector('img.ms-resource-icon-logo');
        expect(img).toBeTruthy();
        expect(img.getAttribute('src')).toBe('http://example.com/logo.png');
    });

    it('should handle hideThumbnail per layout object configuration', () => {
        const hideThumbnail = {
            list: true,
            grid: false
        };
        const data = {
            thumbnail: 'http://example.com/thumb.png'
        };

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="list"
                data={data}
                hideThumbnail={hideThumbnail}
            />,
            document.getElementById('container')
        );

        let img = document.querySelector('.ms-resource-card-img');
        expect(img).toBeFalsy();

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="grid"
                data={data}
                hideThumbnail={hideThumbnail}
            />,
            document.getElementById('container')
        );

        img = document.querySelector('.ms-resource-card-img');
        expect(img).toBeTruthy();
    });

    it('should not render empty entries or items with missing paths', () => {
        const metadata = [
            {
                items: [
                    { path: 'nonExistent1' },
                    { path: 'nonExistent2' }
                ]
            },
            {
                path: 'emptyArray',
                type: 'array'
            }
        ];
        const data = {
            emptyArray: []
        };

        ReactDOM.render(
            <ResourceCard
                layoutCardsStyle="list"
                data={data}
                metadata={metadata}
                hideThumbnail
            />,
            document.getElementById('container')
        );

        const card = document.querySelector('.ms-resource-card');
        expect(card).toBeTruthy();
        expect(card.textContent.trim()).toBe('');
    });
});
