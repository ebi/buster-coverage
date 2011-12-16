// var lcov = require('lcov');
var coverageHelpers = require('coverage-helpers');

function getPreprocessor(filename) {
    return {
        process: function (content) {
            return coverageHelpers.instrument(content, filename);
        }
    };
}

module.exports = function (config) {
    config.on("load:sources", function (sources) {
        config.on("load:resources", function (resourceSet, rootPath) {
            for (var i = 0; i < sources.length; i++) {
                var filename = resourceSet.normalizePath(sources[i]);
                resourceSet.resources[filename].addProcessor(getPreprocessor(filename));
            }
        });
    });

};
