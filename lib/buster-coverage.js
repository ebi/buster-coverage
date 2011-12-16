if ('undefined' !== typeof(require)) {
    var buster = require('buster');
}

buster.coverage = buster.coverage || {};

if ('undefined' !== typeof(require)) {
    buster.coverage.configure = require('./buster-extension');
}

if ('undefined' !== typeof(module)) {
    module.exports = buster.coverage;
}
