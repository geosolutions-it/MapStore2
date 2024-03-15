/* eslint-disable no-console */

try {
    if (process.argv.length !== 4 ) {
        throw Error("\n\nWrong usage, use two parameters\nusage: npm run generate:changelog <oldReleaseNumber> <newReleaseNumber>\nexample: npm run generate:changelog 2022.01.00 2022.02.00\n");
    }
    const oldReleaseNumber = process.argv[2] || "2022.01.00";
    const newReleaseNumber = process.argv[3] || "2022.02.00";
    const currentDate = new Date();
    const today = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

    const changelog = `
## [${newReleaseNumber}](https://github.com/geosolutions-it/MapStore2/tree/v${newReleaseNumber}) (${today})

- **[Full Changelog](https://github.com/geosolutions-it/MapStore2/compare/v${oldReleaseNumber}...v${newReleaseNumber})**
- **[Implemented enhancements](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%22${newReleaseNumber}%22+is%3Aclosed+label%3Aenhancement)**
- **[Fixed bugs](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%22${newReleaseNumber}%22+is%3Aclosed+label%3Abug)**
- **[Closed issues](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%22${newReleaseNumber}%22+is%3Aclosed)**
`;
    console.log(changelog);
} catch (error) {
    console.log(' ');
    console.log('\x1b[41m', '\x1b[37m', 'CHANGELOG GENERATOR - PROCESS ERROR', '\x1b[0m');
    console.log(' ');
    console.log(error);
    console.log(' ');
}

