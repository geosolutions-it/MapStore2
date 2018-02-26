/*
    Implemented from https://github.com/kensnyder/quill-image-resize-module
    - Added resize on iframe
    - Added new Video format
    - Basic toolbar configuration of container
    - exported as function to use current Quill (not window.Quill)
*/

const { defaultsDeep, isObject, isString } = require('lodash');
const IconAlignLeft = '<span class="glyphicon glyphicon-align-left" style="display: inline-block; margin-top: 4px;"></span>';
const IconAlignCenter = '<span class="glyphicon glyphicon-align-center" style="display: inline-block; margin-top: 4px;"></span>';
const IconAlignRight = '<span class="glyphicon glyphicon-align-right" style="display: inline-block; margin-top: 4px;"></span>';
const IconAlignClear = '<span class="glyphicon glyphicon-remove" style="display: inline-block; margin-top: 4px;"></span>';
const videoHeight = 200;
require('./assets/css/resizemodule.css');

module.exports = Quill => {

    const Embed = Quill.import('blots/embed');
    const Link = Quill.import('formats/link');
    const Parchment = Quill.imports.parchment;
    const FloatStyle = new Parchment.Attributor.Style('float', 'float');
    const MarginStyle = new Parchment.Attributor.Style('margin', 'margin');
    const DisplayStyle = new Parchment.Attributor.Style('display', 'display');
    const WidthStyle = new Parchment.Attributor.Style('width', 'width');

    const DefaultOptions = {
        modules: [
            'DisplaySize',
            'Toolbar',
            'Resize'
        ],
        overlayStyles: {
            position: 'absolute',
            boxSizing: 'border-box',
            border: '1px dashed #444'
        },
        handleStyles: {
            position: 'absolute',
            height: '12px',
            width: '12px',
            backgroundColor: 'white',
            border: '1px solid #777',
            boxSizing: 'border-box',
            opacity: '0.80'
        },
        displayStyles: {
            position: 'absolute',
            font: '12px/1.0 Arial, Helvetica, sans-serif',
            padding: '4px 8px',
            textAlign: 'center',
            backgroundColor: 'white',
            color: '#333',
            border: '1px solid #777',
            boxSizing: 'border-box',
            opacity: '0.80',
            cursor: 'default'
        },
        toolbarStyles: {
            position: 'absolute',
            top: '-12px',
            right: '0',
            left: '0',
            height: '0',
            minWidth: '100px',
            font: '12px/1.0 Arial, Helvetica, sans-serif',
            textAlign: 'center',
            color: '#333',
            boxSizing: 'border-box',
            cursor: 'default'
        },
        toolbarButtonStyles: {
            display: 'inline-block',
            width: '24px',
            height: '24px',
            background: 'white',
            border: '1px solid #999',
            verticalAlign: 'middle'
        },
        toolbarButtonSvgStyles: {
            fill: '#444',
            stroke: '#444',
            strokeWidth: '2'
        }
    };

    class BaseModule {
        constructor(resizer) {
            this.overlay = resizer.overlay;
            this.domNode = resizer.domNode;
            this.options = resizer.options;
            this.requestUpdate = resizer.onUpdate;
        }
        /*
            requestUpdate (passed in by the library during construction, above) can be used to let the library know that
            you've changed something about the image that would require re-calculating the overlay (and all of its child
            elements)

            For example, if you add a margin to the element, you'll want to call this or else all the controls will be
            misaligned on-screen.
        */

        /*
            onCreate will be called when the element is clicked on

            If the module has any user controls, it should create any containers that it'll need here.
            The overlay has absolute positioning, and will be automatically repositioned and resized as needed, so you can
            use your own absolute positioning and the 'top', 'right', etc. styles to be positioned relative to the element
            on-screen.
        */
        onCreate = () => { };

        /*
            onDestroy will be called when the element is de-selected, or when this module otherwise needs to tidy up.

            If you created any DOM elements in onCreate, please remove them from the DOM and destroy them here.
        */
        onDestroy = () => { };

        /*
            onUpdate will be called any time that the element is changed (e.g. resized, aligned, etc.)

            This frequently happens during resize dragging, so keep computations light while here to ensure a smooth
            user experience.
        */
        onUpdate = () => { };
    }


    class DisplaySize extends BaseModule {
        onCreate = () => {
            // Create the container to hold the size display
            this.display = document.createElement('div');

            // Apply styles
            Object.assign(this.display.style, this.options.displayStyles);

            // Attach it
            this.overlay.appendChild(this.display);
        };

        onDestroy = () => { };

        onUpdate = () => {
            if (!this.display || !this.domNode) {
                return;
            }

            const size = this.getCurrentSize();
            this.display.innerHTML = size.join(' &times; ');
            if (size[0] > 120 && size[1] > 30) {
                // position on top of image
                Object.assign(this.display.style, {
                    right: '4px',
                    bottom: '4px',
                    left: 'auto'
                });
            } else if (this.domNode.style.float === 'right') {
                // position off bottom left
                const dispRect = this.display.getBoundingClientRect();
                Object.assign(this.display.style, {
                    right: 'auto',
                    bottom: `-${dispRect.height + 4}px`,
                    left: `-${dispRect.width + 4}px`
                });
            } else {
                // position off bottom right
                const dispRect = this.display.getBoundingClientRect();
                Object.assign(this.display.style, {
                    right: `-${dispRect.width + 4}px`,
                    bottom: `-${dispRect.height + 4}px`,
                    left: 'auto'
                });
            }
        };

        getCurrentSize = () => this.domNode.tagName.toUpperCase() === 'IMG' ?
        [
            this.domNode.width,
            Math.round((this.domNode.width / this.domNode.naturalWidth) * this.domNode.naturalHeight)
        ] : [
            this.domNode.clientWidth,
            this.domNode.clientHeight
        ];
    }


    class Resize extends BaseModule {
        onCreate = () => {
            // track resize handles
            this.boxes = [];

            // add 4 resize handles
            this.addBox('nwse-resize'); // top left
            this.addBox('nesw-resize'); // top right
            this.addBox('nwse-resize'); // bottom right
            this.addBox('nesw-resize'); // bottom left

            this.positionBoxes();
        };

        onDestroy = () => {
            // reset drag handle cursors
            this.setCursor('');
        };

        positionBoxes = () => {
            const handleXOffset = `${-parseFloat(this.options.handleStyles.width) / 2}px`;
            const handleYOffset = `${-parseFloat(this.options.handleStyles.height) / 2}px`;

            // set the top and left for each drag handle
            [
                { left: handleXOffset, top: handleYOffset },        // top left
                { right: handleXOffset, top: handleYOffset },       // top right
                { right: handleXOffset, bottom: handleYOffset },    // bottom right
                { left: handleXOffset, bottom: handleYOffset }     // bottom left
            ].forEach((pos, idx) => {
                Object.assign(this.boxes[idx].style, pos);
            });
        };

        addBox = (cursor) => {
            // create div element for resize handle
            const box = document.createElement('div');

            // Star with the specified styles
            Object.assign(box.style, this.options.handleStyles);
            box.style.cursor = cursor;

            // Set the width/height to use 'px'
            box.style.width = `${this.options.handleStyles.width}px`;
            box.style.height = `${this.options.handleStyles.height}px`;

            // listen for mousedown on each box
            box.addEventListener('mousedown', this.handleMousedown, false);
            // add drag handle to document
            this.overlay.appendChild(box);
            // keep track of drag handle
            this.boxes.push(box);
        };

        handleMousedown = (evt) => {
            // note which box
            this.dragBox = evt.target;
            // note starting mousedown position
            this.dragStartX = evt.clientX;
            this.dragStartY = evt.clientY;
            // store the width before the drag
            this.preDragWidth = this.domNode.width || this.domNode.naturalWidth || this.domNode.clientWidth;
            this.preDragHeight = this.domNode.height || this.domNode.naturalHeight || this.domNode.clientHeight;
            // set the proper cursor everywhere
            this.setCursor(this.dragBox.style.cursor);
            // listen for movement and mouseup
            document.addEventListener('mousemove', this.handleDrag, false);
            document.addEventListener('mouseup', this.handleMouseup, false);
        };

        handleMouseup = () => {
            // reset cursor everywhere
            this.setCursor('');
            // stop listening for movement and mouseup
            document.removeEventListener('mousemove', this.handleDrag);
            document.removeEventListener('mouseup', this.handleMouseup);
        };

        handleDrag = (evt) => {
            if (!this.domNode) {
                // image not set yet
                return;
            }
            // update image size
            const deltaX = evt.clientX - this.dragStartX;
            const deltaY = evt.clientY - this.dragStartY;

            if (this.dragBox === this.boxes[0] || this.dragBox === this.boxes[3]) {
                // left-side resize handler; dragging right shrinks image
                if (this.domNode.tagName.toUpperCase() === 'IMG') {
                    this.domNode.width = Math.round(this.preDragWidth - deltaX);
                } else if (this.domNode.getAttribute('class') === 'ms-quill-iframe') {
                    const iframe = this.domNode.parentNode && this.domNode.parentNode.children && this.domNode.parentNode.children[0] || null;
                    if (iframe) {
                        this.domNode.parentNode.parentNode.style.width = Math.round(this.preDragWidth - deltaX) + 'px';
                        iframe.setAttribute('width', this.domNode.parentNode.parentNode.clientWidth);
                        this.domNode.style.width = this.domNode.parentNode.parentNode.clientWidth + 'px';
                    }
                }
            } else {
                // right-side resize handler; dragging right enlarges image
                if (this.domNode.tagName.toUpperCase() === 'IMG') {
                    this.domNode.width = Math.round(this.preDragWidth + deltaX);
                } else if (this.domNode.getAttribute('class') === 'ms-quill-iframe') {
                    const iframe = this.domNode.parentNode && this.domNode.parentNode.children && this.domNode.parentNode.children[0] || null;
                    if (iframe) {
                        this.domNode.parentNode.parentNode.style.width = Math.round(this.preDragWidth + deltaX) + 'px';
                        iframe.setAttribute('width', this.domNode.parentNode.parentNode.clientWidth);
                        this.domNode.style.width = this.domNode.parentNode.parentNode.clientWidth + 'px';
                    }
                }
            }

            // modify height
            if (this.domNode.getAttribute('class') === 'ms-quill-iframe') {
                const iframe = this.domNode.parentNode && this.domNode.parentNode.children && this.domNode.parentNode.children[0] || null;
                if (iframe) {
                    this.domNode.parentNode.parentNode.style.height = Math.round(this.preDragHeight + deltaY) + 'px';
                    iframe.setAttribute('height', this.domNode.parentNode.parentNode.clientHeight);
                    this.domNode.style.height = this.domNode.parentNode.parentNode.clientHeight + 'px';
                }
            }

            this.requestUpdate();
        };

        setCursor = (value) => {
            [
                document.body,
                this.domNode.tagName.toUpperCase() === 'IMG' ? this.domNode : this.domNode.parentNode.parentNode
            ].forEach((el) => {
                el.style.cursor = value;   // eslint-disable-line no-param-reassign
            });
        };
    }

    class Toolbar extends BaseModule {
        onCreate = () => {
            // Setup Toolbar
            this.toolbar = document.createElement('div');
            Object.assign(this.toolbar.style, this.options.toolbarStyles);
            this.overlay.appendChild(this.toolbar);

            // Setup Buttons
            this._defineAlignments();
            this._addToolbarButtons();
        };

        // The toolbar and its children will be destroyed when the overlay is removed
        onDestroy = () => { };

        // Nothing to update on drag because we are are positioned relative to the overlay
        onUpdate = () => { };

        _defineAlignments = () => {
            const domNode = this.domNode.tagName.toUpperCase() === 'IMG' ? this.domNode : this.domNode.parentNode.parentNode;
            this.alignments = [
                {
                    icon: IconAlignLeft,
                    apply: () => {
                        DisplayStyle.add(domNode, 'inline');
                        FloatStyle.add(domNode, 'left');
                        MarginStyle.add(domNode, '0 1em 1em 0');
                    },
                    isApplied: () => FloatStyle.value(domNode) === 'left'
                },
                {
                    icon: IconAlignCenter,
                    apply: () => {
                        DisplayStyle.add(domNode, 'block');
                        FloatStyle.remove(domNode);
                        MarginStyle.add(domNode, 'auto');
                    },
                    isApplied: () => MarginStyle.value(domNode) === 'auto'
                },
                {
                    icon: IconAlignRight,
                    apply: () => {
                        DisplayStyle.add(domNode, 'inline');
                        FloatStyle.add(domNode, 'right');
                        MarginStyle.add(domNode, '0 0 1em 1em');
                    },
                    isApplied: () => FloatStyle.value(domNode) === 'right'
                },
                {
                    icon: IconAlignClear,
                    apply: () => {
                        DisplayStyle.add(domNode, 'block');
                        FloatStyle.add(domNode, 'none');
                        MarginStyle.add(domNode, '0');
                        WidthStyle.add(domNode, '100%');
                        if (domNode.getAttribute('class') === 'ql-video') {
                            const iframe = domNode.querySelector('IFRAME') || null;
                            const overlay = domNode.querySelector('.ms-quill-iframe') || null;
                            if (iframe && overlay) {
                                domNode.style.width = '100%';
                                iframe.setAttribute('width', '100%');
                                overlay.style.width = '100%';

                                domNode.style.height = videoHeight + 'px';
                                iframe.setAttribute('height', videoHeight);
                                overlay.style.height = videoHeight + 'px';
                            }
                        }
                    },
                    isApplied: () => false
                }
            ];
        };

        _addToolbarButtons = () => {
            const buttons = [];

            this.alignments.forEach((alignment, idx) => {
                const button = document.createElement('span');
                buttons.push(button);
                button.innerHTML = alignment.icon;
                button.addEventListener('click', () => {
                    // deselect all buttons
                    buttons.forEach(btn => btn.style.filter = '');
                    if (alignment.isApplied()) {
                        // If applied, unapply
                        FloatStyle.remove(this.domNode);
                        MarginStyle.remove(this.domNode);
                        DisplayStyle.remove(this.domNode);
                    } else {
                        // otherwise, select button and apply
                        this._selectButton(button);
                        alignment.apply();
                    }
                    // image may change position; redraw drag handles
                    this.requestUpdate();
                });
                Object.assign(button.style, this.options.toolbarButtonStyles);
                if (idx > 0) {
                    button.style.borderLeftWidth = '0';
                }
                Object.assign(button.style, this.options.toolbarButtonSvgStyles);
                if (alignment.isApplied()) {
                    // select button if previously applied
                    this._selectButton(button);
                }
                this.toolbar.appendChild(button);
            });
        };

        _selectButton = (button) => {
            button.style.filter = 'invert(20%)';
        };

    }


    const knownModules = { DisplaySize, Toolbar, Resize };

    /**
     * Custom module for quilljs to allow user to resize <img> elements
     * (Works on Chrome, Edge, Safari and replaces Firefox's native resize behavior)
     * @see https://quilljs.com/blog/building-a-custom-module/
     */

    class ResizeModule {

        constructor(quill, options = {}) {
            // save the quill reference and options
            this.quill = quill;

            // Apply the options to our defaults, and stash them for later
            // defaultsDeep doesn't do arrays as you'd expect, so we'll need to apply the classes array from options separately
            let moduleClasses = false;
            if (options.modules) {
                moduleClasses = options.modules.slice();
            }

            // Apply options to default options
            this.options = defaultsDeep({}, options, DefaultOptions);

            // (see above about moduleClasses)
            if (moduleClasses !== false) {
                this.options.modules = moduleClasses;
            }

            // disable native image resizing on firefox
            document.execCommand('enableObjectResizing', false, 'false');

            // respond to clicks inside the editor
            this.quill.root.addEventListener('click', this.handleClick, false);

            this.quill.root.parentNode.style.position = this.quill.root.parentNode.style.position || 'relative';

            // setup modules
            this.moduleClasses = this.options.modules;

            this.modules = [];
        }

        initializeModules = () => {
            this.removeModules();

            this.modules = this.moduleClasses.map(
                ModuleClass => new (knownModules[ModuleClass] || ModuleClass)(this),
            );

            this.modules.forEach(
                (module) => {
                    module.onCreate();
                },
            );

            this.onUpdate();
        };

        onUpdate = () => {
            this.repositionElements();
            this.modules.forEach(
                (module) => {
                    module.onUpdate();
                },
            );
        };

        removeModules = () => {
            this.modules.forEach(
                (module) => {
                    module.onDestroy();
                },
            );

            this.modules = [];
        };

        handleClick = (evt) => {
            if (evt.target && evt.target.tagName && evt.target.tagName.toUpperCase() === 'IMG'
            || evt.target && evt.target.tagName && evt.target.tagName.toUpperCase() === 'DIV' && evt.target.getAttribute('class') === 'ms-quill-iframe') {
                if (this.domNode === evt.target) {
                    // we are already focused on this image
                    return;
                }
                if (this.domNode) {
                    // we were just focused on another image
                    this.hide();
                }
                // clicked on an image inside the editor
                this.show(evt.target);
            } else if (this.domNode) {
                // clicked on a non image
                this.hide();
            }
        };

        show = (domNode) => {
            // keep track of this img element
            this.domNode = domNode;
            this.showOverlay();

            this.initializeModules();
        };

        showOverlay = () => {
            if (this.overlay) {
                this.hideOverlay();
            }

            this.quill.setSelection(null);

            // prevent spurious text selection
            this.setUserSelect('none');

            // listen for the image being deleted or moved
            document.addEventListener('keyup', this.checkImage, true);
            this.quill.root.addEventListener('input', this.checkImage, true);

            const editor = this.quill.root.parentNode.querySelector('.ql-editor');
            if (editor) {
                editor.style.overflow = 'hidden';
            }

            // Create and add the overlay
            this.overlay = document.createElement('div');
            Object.assign(this.overlay.style, this.options.overlayStyles);

            if (this.domNode && this.domNode.getAttribute('class') === 'ms-quill-iframe') {
                this.input = document.createElement('input');
                this.input.style.position = 'absolute';
                this.input.style.left = '8px';
                this.input.style.top = '16px';
                this.input.style.width = 'calc(100% - 16px)';
                const iframeSRC = this.domNode.parentNode && this.domNode.parentNode.children && this.domNode.parentNode.children[0] && this.domNode.parentNode.children[0].getAttribute('src') || '';
                this.input.setAttribute('value', iframeSRC);
                this.overlay.appendChild(this.input);
                this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }

            this.quill.root.parentNode.appendChild(this.overlay);

            this.repositionElements();
        };

        hideOverlay = () => {
            if (!this.overlay) {
                return;
            }

            // Remove the overlay
            if (this.input) {
                if (this.domNode.parentNode && this.domNode.parentNode.children && this.domNode.parentNode.children[0] && this.domNode.parentNode.children[0]) {
                    this.domNode.parentNode.children[0].setAttribute('src', this.input.value);
                }
                this.overlay.removeChild(this.input);
                this.input = undefined;
            }
            const editor = this.quill.root.parentNode.querySelector('.ql-editor');
            if (editor) {
                editor.style.overflow = 'auto';
            }

            this.quill.root.parentNode.removeChild(this.overlay);
            this.overlay = undefined;

            // stop listening for image deletion or movement
            document.removeEventListener('keyup', this.checkImage);
            this.quill.root.removeEventListener('input', this.checkImage);

            // reset user-select
            this.setUserSelect('');
        };

        repositionElements = () => {
            if (!this.overlay || !this.domNode) {
                return;
            }

            // position the overlay over the image
            const parent = this.quill.root.parentNode;
            const domNodeRect = this.domNode.tagName.toUpperCase() === 'IMG' ? this.domNode.getBoundingClientRect() : this.domNode.parentNode.parentNode.getBoundingClientRect();
            const containerRect = parent.getBoundingClientRect();
            Object.assign(this.overlay.style, {
                left: `${domNodeRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
                top: `${domNodeRect.top - containerRect.top + parent.scrollTop}px`,
                width: `${domNodeRect.width}px`,
                height: `${domNodeRect.height}px`
            });
        };

        hide = () => {
            this.hideOverlay();
            this.removeModules();
            this.domNode = undefined;
        };

        setUserSelect = (value) => {
            [
                'userSelect',
                'mozUserSelect',
                'webkitUserSelect',
                'msUserSelect'
            ].forEach((prop) => {
                // set on contenteditable element and <html>
                this.quill.root.style[prop] = value;
                document.documentElement.style[prop] = value;
            });
        };

        checkImage = (evt) => {
            if (this.domNode && this.input !== evt.target) {
                if ((evt.keyCode === 46 || evt.keyCode === 8) && this.domNode.tagName.toUpperCase() === 'IMG') {
                    Quill.find(this.domNode).deleteAt(0);
                }
                this.hide();
            }
        };
    }

    const ATTRIBUTES = [
        'height',
        'width'
    ];

    class Video extends Embed {
        static create(value) {
            let src = '';
            let width = '100%';
            let height = videoHeight;
            if (isObject(value)) {
                src = value.src || src;
                width = value.width || width;
                height = value.height || height;
            } else {
                src = value || src;
            }

            let node = super.create(value);
            node.style.position = 'relative';
            if (value.domNodeStyle) {
                Object.assign(node.style, value.domNodeStyle);
            }
            node.style.width = isString(width) && width.indexOf('%') !== -1 ? width : (width + 'px');
            node.style.height = isString(height) && height.indexOf('%') !== -1 ? height : (height + 'px');
            let iframe = document.createElement('IFRAME');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', true);
            iframe.setAttribute('src', this.sanitize(src));
            iframe.setAttribute('width', width);
            iframe.setAttribute('height', height);
            let overlay = document.createElement('DIV');
            overlay.setAttribute('class', 'ms-quill-iframe');
            overlay.style.overflow = 'hidden';
            overlay.style.position = 'absolute';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = isString(width) && width.indexOf('%') !== -1 ? width : (width + 'px');
            overlay.style.height = isString(height) && height.indexOf('%') !== -1 ? height : (height + 'px');
            overlay.style.border = '1px solid #ddd';
            node.appendChild(iframe);
            node.appendChild(overlay);
            return node;
        }
        static formats(domNode) {
            return ATTRIBUTES.reduce(function(formats, attribute) {
                if (domNode.hasAttribute(attribute)) {
                    formats[attribute] = domNode.getAttribute(attribute);
                }
                return formats;
            }, {});
        }
        static sanitize(url) {
            return Link.sanitize(url);
        }
        static value(domNode) {
            const iframe = domNode.children && domNode.children[0] && domNode.children[0].children && domNode.children[0].children[0];
            return iframe ? {
                src: iframe.getAttribute('src'),
                width: iframe.getAttribute('width'),
                height: iframe.getAttribute('height'),
                domNodeStyle: {...domNode.style}
            } : '';
        }
        format(name, value) {
            if (ATTRIBUTES.indexOf(name) > -1) {
                if (value) {
                    this.domNode.setAttribute(name, value);
                } else {
                    this.domNode.removeAttribute(name);
                }
            } else {
                super.format(name, value);
            }
        }
    }

    Video.blotName = 'video';
    Video.className = 'ql-video';
    Video.tagName = 'DIV';

    const toolbarConfig = {
        container: [
            [{ header: ['1', '2', '3', false] }],
            ['bold', 'italic', 'underline', 'link'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'], ['video']
        ]
    };

    return {
        ResizeModule,
        Video,
        toolbarConfig
    };
};
