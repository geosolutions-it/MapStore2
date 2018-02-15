const {compose} = require('recompose');
module.exports = compose(
    require('./wfsTable'),
    require('./deleteWidget')
);
