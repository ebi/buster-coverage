var path = require('path');
var coverageHelpers = require('coverage-helpers');

function processor(resource, content) {
    return coverageHelpers.instrument(content, resource.path).toString();
}

module.exports = {
    beforeRun: function (config, analyzer) {
        config.on('load:sources', function (resourceSet) {
            resourceSet.addProcessor(processor);
        });
    }
};
