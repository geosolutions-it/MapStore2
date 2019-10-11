
try {
    console.log(' ');
    console.log(' -------------------------------------------------------------------------------');
    console.log('  ICONS GENERATOR - PROCESS START');
    console.log(' -------------------------------------------------------------------------------');
    console.log(' ');
    const webfontsGenerator = require('vusion-webfonts-generator');
    const fs = require('fs');
    const path = require('path');
    const svgDirectory = path.join(__dirname, '../web/client/themes/default/svg/');
    const files = fs.readdirSync(svgDirectory);
    const destinationDirectory = path.join(__dirname, '../web/client/themes/default/');
    const dest = path.join(destinationDirectory, 'icons');
    const cssDest = path.join(destinationDirectory, 'icons.less');
    const cssTemplate = path.join(destinationDirectory, 'icons.template.hbs');
    console.log(`  Template -> ${cssTemplate}`);
    console.log(' ');
    console.log(' ');
    webfontsGenerator({
        files: files.map(function(file) {
            return `${svgDirectory}${file}`;
        }),
        dest: dest,
        cssDest: cssDest,
        fontName: 'icons',
        templateOptions: {
            classPrefix: 'glyphicon-',
            baseSelector: '.glyphicon'
        },
        cssTemplate: cssTemplate
    }, function(error) {
        if (error) {
            console.log(' ');
            console.log('\x1b[41m', '\x1b[37m', 'ICONS GENERATOR - PROCESS ERROR', '\x1b[0m');
            console.log(' ');
            console.log(error);
            console.log(' ');
        } else {
            console.log(' ');
            console.log('\x1b[42m', '\x1b[30m', 'ICONS GENERATOR - SUCCESS', '\x1b[0m');
            console.log(' ');
            console.log(`  Generated fonts in eot, svg, ttf, woff and woff2 formats from ${files.length} icons`);
            console.log(' ');
            console.log(`  - fonts      -> ${dest}`);
            console.log(`  - icons.less -> ${cssDest}`);
            console.log(' ');
        }
        console.log(' -------------------------------------------------------------------------------');
        console.log('  ICONS GENERATOR - PROCESS END');
        console.log(' -------------------------------------------------------------------------------');
        console.log(' ');
    });
} catch (error) {
    console.log(' ');
    console.log('\x1b[41m', '\x1b[37m', 'ICONS GENERATOR - PROCESS ERROR', '\x1b[0m');
    console.log(' ');
    console.log(error);
    console.log(' ');
    console.log(' -------------------------------------------------------------------------------');
    console.log('  ICONS GENERATOR - PROCESS END');
    console.log(' -------------------------------------------------------------------------------');
    console.log(' ');
}

