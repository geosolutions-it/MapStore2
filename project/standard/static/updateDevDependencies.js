const denodeify = require('denodeify');
const fs = require('fs');
const writeFile = denodeify(fs.writeFile);

const updateProjectDevDependencies = () => {
    process.stdout.write('Updating devDepndencies in package.json...\n');
    const projPackageJSON = require('./package.json');
    const ms2PackageJSON = require('./MapStore2/package.json');
    const packageJSON = { ...projPackageJSON , devDependencies: ms2PackageJSON.devDependencies};
    return writeFile('./package.json', JSON.stringify(packageJSON, null, 4));

}
updateProjectDevDependencies().then(() => {
    process.stdout.write('devDependencies update OK!\n');
    process.exit();
})
.catch((err) => {
    process.stdout.write('Error updatind devDependencies\n');
    process.stderr.write(err + '\n');
});