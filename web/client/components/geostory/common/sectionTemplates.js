
import uuidv1 from 'uuid/v1';

const sectionTemplates = (type) => {
    const section = {
        cover: {
            type: 'cover',
            id: uuidv1(),
            contents: [
                {
                    id: uuidv1(),
                    type: 'cover',
                    factor: 1,
                    offset: 0,
                    background: {
                        type: 'image',
                        cover: true,
                        src: 'assets/img/stsci-h-p1821a-m-1699x2000.jpg'
                    },
                    foreground: {
                        cover: true,
                        text: '<h1>Enter title...</h1>'
                    }
                }
            ]
        },
        title: {
            type: 'title',
            id: uuidv1(),
            contents: [
                {
                    id: uuidv1(),
                    type: 'title',
                    foreground: {
                        mediaCover: true,
                        mediaSrc: 'assets/img/map.jpg',
                        mediaType: 'image',
                        text: '<h1>Enter title...</h1>'
                    }
                }
            ]
        },
        paragraph: {
            type: 'paragraph',
            id: uuidv1(),
            contents: [
                {
                    id: uuidv1(),
                    type: 'paragraph',
                    foreground: {
                        text: '<p>Enter text...</p>'
                    }
                }
            ]
        },
        immersive: {
            type: 'immersive',
            title: 'Immersive',
            id: uuidv1(),
            contents: [
                {
                    id: uuidv1(),
                    type: 'column',
                    layer: 'block',
                    background: {
                        type: 'image',
                        cover: true,
                        src: 'assets/img/map.jpg'
                    },
                    foreground: {
                        textContainerPosition: 'left',
                        text: '<h2>Title</h2><p>Enter content...</p>'
                    }
                }
            ]
        },
        immersiveContent: {
            id: uuidv1(),
            type: 'column',
            layer: 'block',
            background: {
                type: 'image',
                cover: true,
                src: 'assets/img/map.jpg'
            },
            foreground: {
                textContainerPosition: 'left',
                text: '<h2>Title</h2><p>Enter content...</p>'
            }
        }
    };
    return section[type] || { };
};

export default sectionTemplates;
