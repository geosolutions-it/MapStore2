/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const AgentUtils = {

    getWindowSize: function() {
        let width = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;

        let height = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

        return {maxWidth: width, maxHeight: height};
    },
    /**
     * This has been cloned from https://github.com/dwighthouse/onfontready
     * because it was throwing a syntax error with IE11
     *
     * fontName : Font name used in the `@font-face` declaration
     * onReady  : Function called upon successful font load and parse detection
     * options  : Optional parameters
     * options.timeoutAfter : Milliseconds to wait before giving up Triggers options.onTimeout call Unset or 0 will result in an indefinite wait
     * options.onTimeout    : Called after options.timeoutAfter milliseconds have elapsed without an onReady call
     * options.sampleText   : Text string used to test font loading Defaults to " " (space character)
     * options.generic      : Boolean set to true if attempting to detect generic family font
     * root                 : Undefined variable used by function
     * tryFinish            : Undefined variable used by function
    */
    onfontready: (fontNameNew, onReady, options = {}, rootNew, tryFinishNew) => {
        let fontName = fontNameNew;
        let root = rootNew;
        let tryFinish = tryFinishNew;
        // root and tryFinish parameters prevent the need for var statement
        let fontNameCopy = fontName;
        if (process.env.isTest) {
            // Store a copy because later code will reuse the fontName variable
            // Use var to pull it out of the if block's scope

            const tests = {};

            const tryCreate = (name) => {
                tests[name] = tests[name] || {
                    rootCount: 0,
                    iframesCreated: false,
                    timedOut: false,
                    fontLoaded: false,
                    requiredExtraTimeout: false
                };
                return tests[name];
            };

            // A helper function tracks info about internal processes for testing
            window.reporter = window.reporter || {
                modifyRootCount(name, increment) {
                    tryCreate(name).rootCount += increment;
                },
                iframesCreated(name) {
                    tryCreate(name).iframesCreated = true;
                },
                timedOut(name) {
                    tryCreate(name).timedOut = true;
                },
                fontLoaded(name) {
                    tryCreate(name).fontLoaded = true;
                },
                requiredExtraTimeout(name) {
                    tryCreate(name).requiredExtraTimeout = true;
                },
                getTests() {
                    return tests;
                }
            };
        }

        // Ensure options is defined to prevent access errors

        // A 0 timeoutAfter will prevent the timeout functionality
        if (options.timeoutAfter) {
            setTimeout(() => {
                // Prevent onTimeout call after shutdown
                if (root) {
                    if (process.env.isTest) {
                        window.reporter.modifyRootCount(fontNameCopy, -1);
                    }

                    // Shutdown should occur even if onTimeout is not defined
                    document.body.removeChild(root);

                    // Break the reference to the DOM element to allow GC to run
                    // Assigning to 0 also results in falsy root tests elsewhere
                    root = 0;

                    // This won't prevent TypeError if onTimeout is not a function
                    if (options.onTimeout) {
                        if (process.env.isTest) {
                            window.reporter.timedOut(fontNameCopy);
                        }
                        options.onTimeout();
                    }
                }
            }, options.timeoutAfter);
        }

        // Measures the test elements to determine if the font has loaded
        // Always safe to call, even after shutdown
        // Using function assignment compresses better than function declaration
        tryFinish = () => {
            // Prevent test or onReady call after shutdown
            // The width of the parent elements are influenced by the children,
            //   so it is sufficient to measure the parents
            // clientWidth only measures to integer accuracy
            //   This is sufficient for such large font sizes (999px)
            // Both compared values are integers, so double equality is sufficient
            if (root && root.firstChild.clientWidth === root.lastChild.clientWidth) {
                if (process.env.isTest) {
                    window.reporter.modifyRootCount(fontNameCopy, -1);
                }

                document.body.removeChild(root);

                // Break the reference to the DOM element to allow GC to run
                // Assigning to 0 also results in falsy root tests elsewhere
                root = 0;

                if (process.env.isTest) {
                    window.reporter.fontLoaded(fontNameCopy);
                }

                onReady();
            }
        };

        if (process.env.isTest) {
            window.reporter.modifyRootCount(fontNameCopy, 1);
        }

        if (!process.env.isLegacy) {
            // Attempt to finish early if the font is already loaded
            // The tryFinish call happens after the test elements are added
            tryFinish(
                // Save bytes by creating and assigning the root div inside call
                // appendChild returns the root, allowing innerHTML usage inline
                document.body.appendChild(root = document.createElement('div')).innerHTML =
                // position:fixed breaks the element out of page flow
                //   Being out of flow makes the div size to the text
                // white-space:pre ensures no text wrapping will occur
                // Out of bounds percentage bottom/right prevents scrollbars
                // font combines font-size and font-family
                // Font size 999px differentiates fallback fonts
                // Using font size in pixels prevents possible
                //   failure due to zero-sized default page fonts
                // Using a <pre> instead of a <div> tag might be smaller, but
                //   it is more likely to interfere with page styles
                '<div style="position:fixed;white-space:pre;bottom:999%;right:999%;font:999px ' +
                    // Generic fonts should be quote-less
                    (options.generic ? '' : "'") + fontName + (options.generic ? '' : "'") +
                // Fallback font sizes text differently from
                //   the adjacent div until the font has loaded
                ',serif">' +
                    // A single space is the text default
                    (options.sampleText || ' ') +
                '</div>' +
                '<div style="position:fixed;white-space:pre;bottom:999%;right:999%;font:999px ' +
                    (options.generic ? '' : "'") + fontName + (options.generic ? '' : "'") +
                ',monospace">' +
                    (options.sampleText || ' ') +
                '</div>'
            );
        }

        if (process.env.isLegacy) {
            // Attempt to finish early if the font is already loaded
            // The tryFinish call happens after the test elements are added
            tryFinish(
                // Save bytes by creating and assigning the root div inside call
                // appendChild returns the root, allowing innerHTML usage inline
                document.body.appendChild(root = document.createElement('div')).innerHTML =
                    // IE6 cannot create automatically sized divs that will
                    //   contain an absolutely positioned element
                    //   Such elements will instead break out of their bounds
                    //   The only other method to associate the width of one
                    //   element's natural size with the size of another is table
                    // Style value with no spaces does not require quotes
                    // position:absolute breaks the element out of page flow
                    // IE6 does not support position:fixed
                    // Out of bounds percentage bottom/right prevents scrollbars
                    // width:auto prevents interference from width:100% styles
                    //   which are commonly added
                    '<table style=position:absolute;bottom:999%;right:999%;width:auto>' +
                        // <tbody> tag is implied
                        '<tr>' +
                            // position:relative allows the iframe's absolute
                            //   positioning to be relative to the <td>
                            '<td style=position:relative>' +
                    // </td> is implied
                        // </tr> is implied
                        '<tr>' +
                            // Inner <span> needs surrounding, equal-sized periods
                            //   to prevent some older browsers from collapsing the
                            //   whitespace character (space) at insertion time
                            // Monospace font compresses better than serif here
                            // white-space:pre ensures no text wrapping will occur
                            '<td style="font:999px monospace;white-space:pre">' +
                                // font combines font-size and font-family
                                // Font size 999px differentiates fallback fonts
                                // Using font size in pixels prevents possible
                                //   failure due to zero-sized default page fonts
                                '.<span style="font:999px ' +
                                    // Generic fonts should be quote-less
                                    //   (except in IE6 and IE7, due to bug)
                                    (options.generic ? '' : "'") + fontName + (options.generic ? '' : "'") +
                                    // Fallback font sizes text differently from
                                    //   the adjacent div until the font has loaded
                                    ',serif">' +
                                        // A single space is the text default
                                        (options.sampleText || ' ') +
                                '</span>.' +
                    // Closing tags for <td>, <tr>, and <tbody> are implied
                    '</table>' +
                    '<table style=position:absolute;bottom:999%;right:999%;width:auto>' +
                        '<tr>' +
                            '<td style=position:relative>' +
                        '<tr>' +
                            '<td style="font:999px monospace;white-space:pre">' +
                                '.<span style="font:999px ' +
                                    (options.generic ? '' : "'") + fontName + (options.generic ? '' : "'") +
                                    ',monospace">' +
                                        (options.sampleText || ' ') +
                                '</span>.' +
                    '</table>'
            );
        }

        // If the font is already loaded, tryFinish will have already destroyed
        //   the root reference, so the iframes will never be inserted
        if (root) {
            if (process.env.isTest) {
                window.reporter.iframesCreated(fontNameCopy);
            }

            if (!process.env.isLegacy) {
                // The fontName value has already been used, reuse for reference
                // Save bytes by creating and assigning the iframe inside call
                // appendChild returns the iframe, allowing style usage inline
                // The iframe's width only needs to be relative to the parent's
                root.firstChild.appendChild(
                    fontName = document.createElement('iframe')
                ).style.width = '999%';

                // contentWindow becomes available upon DOM insertion
                // Assigning a non-closure function to onresize prevents the
                //   possibility of memory leaks through event handlers
                fontName.contentWindow.onresize = tryFinish;

                // By reusing the fontName (via reassignment), the DOM reference
                //   to the first iframe is broken, reducing memory leak potential
                root.lastChild.appendChild(
                    fontName = document.createElement('iframe')
                ).style.width = '999%';

                fontName.contentWindow.onresize = tryFinish;
            }

            if (process.env.isLegacy) {
                // The fontName value has already been used, reuse for reference
                // Save bytes by creating and assigning the iframe inside call
                // Save bytes by duplicating the deeply nested DOM insertion
                // appendChild returns the iframe, allowing style usage inline
                // position:absolute prevents the iframe from influencing the
                //   table's width
                // Some IE browsers will generate scrollbars if the iframe
                //   isn't positioned to the top-left
                // The iframe's width only needs to be relative to the parent's
                root.firstChild.firstChild.firstChild.firstChild.appendChild(
                    fontName = document.createElement('iframe')
                ).style.cssText = 'position:absolute;bottom:999%;right:999%;width:999%';

                // contentWindow becomes available upon DOM insertion
                // Assigning a non-closure function to onresize prevents the
                //   possibility of memory leaks through event handlers
                // Older IE browsers require iframe onresize event handlers
                //   to be attached via attachEvent
                if (fontName.attachEvent) {
                    fontName.contentWindow.attachEvent('onresize', tryFinish);
                } else {
                    fontName.contentWindow.onresize = tryFinish;
                }

                // By reusing the fontName (via reassignment), the DOM reference
                //   to the first iframe is broken, reducing memory leak potential
                root.lastChild.firstChild.firstChild.firstChild.appendChild(
                    fontName = document.createElement('iframe')
                ).style.cssText = 'position:absolute;bottom:999%;right:999%;width:999%';

                if (fontName.attachEvent) {
                    fontName.contentWindow.attachEvent('onresize', tryFinish);
                } else {
                    fontName.contentWindow.onresize = tryFinish;
                }
            }

            if (!process.env.isTest) {
                // Because of iframe loading nuances, sometimes the font can finish
                //   loading after the root is inserted, but before the onresize
                //   event handler can be added to an iframe, creating a potential
                //   for a missed resize event
                // This setTimeout gives the browser an additional chance to catch
                //   a font load after returning control to the browser
                // By assigning the result of setTimeout (a timeout ID) to the
                //   fontName, the DOM reference to the second iframe is broken,
                //   further reducing the posibility of memory leaks
                fontName = setTimeout(tryFinish);
            }

            if (process.env.isTest) {
                // When testing, report that this timeout was used
                fontName = setTimeout(function() {
                    if (root) {
                        window.reporter.requiredExtraTimeout(fontNameCopy);
                        tryFinish();
                    }
                });
            }
        }
    },
    /**
        uses the onfontready function in a Promise throwing an error it the promise rejects (after 3000ms)
    */
    loadFont: (fontName, options = {}) =>
        new Promise((resolve, reject) => {
            AgentUtils.onfontready(fontName, resolve, {
                timeoutAfter: options.timeoutAfter,

                // Catch should only occur if onTimeout would normally be called
                onTimeout: reject,
                sampleText: options.sampleText,
                generic: options.generic
            });
        })

};


module.exports = AgentUtils;
