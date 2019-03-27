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
const iframeHeight = 200;
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
        iframeIcon: true,
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

                                domNode.style.height = iframeHeight + 'px';
                                iframe.setAttribute('height', iframeHeight);
                                overlay.style.height = iframeHeight + 'px';
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
                    buttons.forEach(btn => {btn.style.filter = '';});
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

    /**
     * ResizeModule class is based on quill-image-resize-module.
     * Enables resize for images and resize/edit src for video formats.
     * iframeIcon options if true add iframe icon and tooltip.
     *
     * @example
     * resizeModule: {
     *  iframeIcon: true
     * }
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

            // add iframe icon if option iframeIcon is true
            if (this.quill.theme && this.quill.theme.modules && this.quill.theme.modules.toolbar && this.quill.theme.modules.toolbar.container && this.options.iframeIcon) {
                const qlVideo = this.quill.theme.modules.toolbar.container.querySelector('.ql-video');
                if (qlVideo) {
                    qlVideo.innerHTML = '<svg viewbox="0 1022 18 18">' +
                    '<g transform="translate(0,0) scale(3.5)">' +
                    '<path d="m 0.20913578,292.52935 -0.0448461,0.0228 c -0.0522035,0.0266 -0.10514577,0.0764 -0.12730166,0.11985 -0.03898753,0.0764 -0.03689917898,-0.0334 -0.036985428654,1.94049 -5.91591201e-5,1.35972 0.00218847865,1.849 0.00864824865,1.87539 0.02503373,0.10227 0.09520806,0.17792 0.19668092,0.21203 0.0202072,0.007 0.54764317,0.009 2.18732434,0.008 l 2.1606966,-0.001 0.044846,-0.0228 c 0.079823,-0.0406 0.1345603,-0.10935 0.1556385,-0.19546 0.00646,-0.0264 0.00872,-0.51567 0.00866,-1.87539 -7.44e-5,-1.97386 0.002,-1.86407 -0.036985,-1.94049 -0.022155,-0.0434 -0.075113,-0.0933 -0.1273161,-0.11985 l -0.044846,-0.0228 H 2.381244 Z m 0.0798849,0.757 H 2.381244 4.4734673 v 1.57107 1.57107 H 2.381244 0.28902068 v -1.57107 z m 2.34957572,0.33607 c -0.028878,0 -0.055626,0.007 -0.080256,0.0204 -0.024631,0.0136 -0.045009,0.0323 -0.061147,0.056 -0.016138,0.0238 -0.025064,0.0501 -0.026762,0.079 -0.032275,0.14948 -0.1758133,0.82556 -0.4306147,2.02822 -0.00679,0.017 -0.010194,0.0348 -0.010194,0.0535 0,0.0306 0.00764,0.0586 0.022928,0.0841 0.015288,0.0255 0.035682,0.0459 0.061162,0.0612 0.025481,0.0153 0.053499,0.0229 0.084076,0.0229 0.022083,0 0.043319,-0.004 0.063703,-0.0127 0.020385,-0.008 0.038221,-0.0204 0.053509,-0.0357 0.015288,-0.0153 0.027184,-0.0331 0.035678,-0.0535 0.00849,-0.0204 0.013592,-0.0416 0.01529,-0.0637 l 0.4255178,-2.00274 c 0.00849,-0.0221 0.013592,-0.045 0.015291,-0.0688 0,-0.0459 -0.016566,-0.0854 -0.04969,-0.11847 -0.033125,-0.0331 -0.072626,-0.0497 -0.1184901,-0.0497 z m -0.1025608,0.30066 c 0.00234,0.002 0.00489,0.003 0.00701,0.005 0.00425,0.003 0.00892,0.006 0.014013,0.008 -0.0051,-0.002 -0.010194,-0.004 -0.01529,-0.008 -0.0017,-0.002 -0.00361,-0.003 -0.00574,-0.005 z m -0.7892346,0.20894 c -0.022083,0 -0.048417,0.008 -0.078993,0.0255 l -0.050968,0.0382 c -0.3295431,0.2599 -0.5461142,0.43063 -0.64973332,0.51217 -0.0441656,0.0187 -0.0764407,0.0514 -0.0968248,0.0981 -0.0203841,0.0467 -0.0246402,0.0947 -0.0127495,0.14398 0.0118908,0.0493 0.038225,0.0858 0.0789933,0.10956 0.057755,0.0408 0.13887122,0.10235 0.24333972,0.18473 0.1044687,0.0824 0.1643489,0.13037 0.179637,0.14396 0.022083,0.017 0.053501,0.0412 0.094269,0.0726 0.040768,0.0314 0.077299,0.0603 0.1095742,0.0866 0.032275,0.0263 0.06285,0.0514 0.091728,0.0752 0.047563,0.034 0.1006454,0.0412 0.1592497,0.0217 0.058604,-0.0195 0.097249,-0.0565 0.1159341,-0.11084 0.016987,-0.0442 0.015701,-0.0896 -0.00383,-0.13632 -0.018887,-0.0452 -0.049313,-0.0772 -0.091223,-0.0962 l -0.03489,-0.0274 c -0.018685,-0.0136 -0.029739,-0.0221 -0.033137,-0.0255 -0.056056,-0.0408 -0.1375864,-0.10108 -0.2446029,-0.18091 -0.1070166,-0.0798 -0.1843053,-0.13759 -0.2318683,-0.17327 0.030576,-0.0221 0.1108352,-0.082 0.240784,-0.17963 0.1299487,-0.0977 0.2297443,-0.17284 0.29939,-0.2255 0.057755,-0.0238 0.093001,-0.0697 0.1057405,-0.1376 0.01274,-0.0679 -0.00467,-0.12314 -0.052231,-0.16561 -0.035672,-0.0357 -0.078129,-0.0527 -0.1273908,-0.051 -0.0034,-0.002 -0.0068,-0.003 -0.010194,-0.003 z m 1.2689006,0 c -0.0034,0 -0.0068,8.5e-4 -0.010194,0.003 -0.049262,-0.002 -0.091718,0.0153 -0.1273909,0.051 -0.047563,0.0425 -0.064971,0.0977 -0.052231,0.16561 0.01274,0.0679 0.047986,0.11382 0.1057406,0.1376 0.069646,0.0527 0.1694416,0.12782 0.29939,0.2255 0.1299488,0.0977 0.210208,0.15755 0.2407841,0.17963 -0.047563,0.0357 -0.1248516,0.0934 -0.2318683,0.17327 -0.1070167,0.0798 -0.1885466,0.14014 -0.2446028,0.18091 l -0.033137,0.0255 c -0.015288,0.0102 -0.024628,0.017 -0.028025,0.0204 -0.00522,0.004 -0.00795,0.007 -0.00826,0.008 -0.041191,0.019 -0.071164,0.0509 -0.089841,0.0955 -0.019535,0.0467 -0.020806,0.0922 -0.00382,0.13632 0.018685,0.0544 0.05733,0.0913 0.1159342,0.11084 0.058604,0.0195 0.1116868,0.0123 0.1592499,-0.0217 0.028877,-0.0238 0.059453,-0.0488 0.091728,-0.0752 0.032275,-0.0263 0.068806,-0.0552 0.1095742,-0.0866 0.040768,-0.0314 0.072186,-0.0556 0.094269,-0.0726 0.032275,-0.0272 0.076018,-0.0629 0.1312245,-0.10702 0.055207,-0.0442 0.10659,-0.0845 0.1541529,-0.12103 0.047563,-0.0365 0.093434,-0.0701 0.1375999,-0.10064 0.040768,-0.0238 0.067102,-0.0603 0.078993,-0.10956 0.011891,-0.0493 0.00763,-0.0973 -0.012749,-0.14398 -0.020384,-0.0467 -0.052659,-0.0794 -0.096824,-0.0981 -0.07814,-0.0612 -0.2947259,-0.23189 -0.6497489,-0.51217 -0.045864,-0.0408 -0.089179,-0.062 -0.1299468,-0.0637 z m -1.4396219,0.15034 c -0.0017,0.008 -0.00256,0.0178 -0.00256,0.028 v -0.0102 -0.0102 z m 1.6103431,0 0.00254,0.008 v 0.0102 0.0102 c 0,-0.0102 -8.416e-4,-0.0195 -0.00254,-0.028 z m -1.6128989,0.051 0.00256,0.0178 0.00254,0.0179 0.00765,0.0178 0.00764,0.0153 h -0.00254 c -0.0017,-0.003 -0.0034,-0.008 -0.0051,-0.0153 l -0.00256,-0.003 -0.0051,-0.0153 c -0.0017,-0.008 -0.00254,-0.0145 -0.00254,-0.0179 -0.0017,-0.007 -0.00256,-0.0127 -0.00256,-0.0178 z m 1.6154252,2.3e-4 c -2.25e-5,0.005 -8.494e-4,0.0109 -0.00252,0.0176 0,0.003 -8.416e-4,0.009 -0.00254,0.0179 l -0.0051,0.0153 -0.00256,0.003 c -0.0017,0.007 -0.0034,0.0119 -0.0051,0.0153 h -0.00254 l 0.00764,-0.0153 0.00765,-0.0178 0.00254,-0.0179 z m -1.50331,0.1552 c 0.00849,0.003 0.01869,0.007 0.030581,0.0102 -0.00679,-0.002 -0.011036,-0.003 -0.012735,-0.003 -0.0051,-0.002 -0.011052,-0.004 -0.017846,-0.008 z m 1.3912246,0 c -0.00679,0.003 -0.01275,0.006 -0.017846,0.008 -0.0017,0 -0.00594,8.6e-4 -0.012735,0.003 0.011891,-0.003 0.022087,-0.007 0.030581,-0.0102 z m -0.7975265,1.2256 c 0.0051,0.002 0.00934,0.004 0.012734,0.008 -0.0051,-0.003 -0.00934,-0.006 -0.012734,-0.008 z"/>' +
                    '</g>' +
                    '</svg>';
                }
            }

            // add iframe tooltip description if option iframeIcon is true
            if (this.quill.theme && this.quill.theme.tooltip && this.quill.theme.tooltip.root && this.quill.theme.tooltip.root.classList && this.quill.theme.tooltip.root.classList.add && this.options.iframeIcon) {
                this.quill.theme.tooltip.root.classList.add('ms-ql-iframe-tooltip');
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

    /**
     * IFrame class extend the Video iframe functionalities to be used with ResizeModule.
     */
    class IFrame extends Embed {
        static create(value) {
            let src = '';
            let width = '100%';
            let height = iframeHeight;
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

    IFrame.blotName = 'video';
    IFrame.className = 'ql-video';
    IFrame.tagName = 'DIV';

    const toolbarConfig = {
        container: [
            [{ header: ['1', '2', '3', false] }],
            ['bold', 'italic', 'underline', 'link'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'], ['video']
        ]
    };

    /**
     * How to enable ResizeModule with iframe.
     *
     * // require library, format and modules
     * const ReactQuill = require('react-quill');
     * const {Quill} = ReactQuill;
     * const {ResizeModule, IFrame, toolbarConfig} = require('path-to/ResizeModule')(Quill);
     *
     * // register new modules and format in Quill
     * Quill.register({
     *  'formats/video': IFrame, // override video format to extend functionalities (resize)
     *  'modules/resizeModule': ResizeModule
     * });
     *
     * // activate module
     *  <ReactQuill modules={
     *      {
     *          resizeModule: {
     *              // options
     *              iframeIcon: false
     *          },
     *          toolbar: toolbarConfig
     *      }
     *  } />
     *
     */

    return {
        ResizeModule,
        IFrame,
        toolbarConfig,
        BaseModule,
        Toolbar,
        DisplaySize,
        Resize
    };
};
