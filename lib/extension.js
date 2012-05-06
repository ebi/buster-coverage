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

        config.on('load:framework', function (resourceSet) {
            resourceSet.addFileResource(path.resolve(__dirname, 'coverage-reporter.js'), {
                path: '/coverage/coverage-reporter.js'
            }).then(function () {
                resourceSet.loadPath.append('/coverage/coverage-reporter.js');
            });
        });

    },

    testRun: function (testRunner, messagingClient) {
        testRunner.on('coverage:report', function (results) {
            console.log(results);
        });
    }
};
