var path = require('path');
var fs = require('fs');
var coverageHelpers = require('coverage-helpers');

function processor(resource, content) {
    var contentBuffer = new Buffer(content, resource.encoding);
    var fullPath = path.join(process.cwd(), resource.path);
    return coverageHelpers.instrument(contentBuffer, fullPath).toString(resource.encoding);
}

module.exports = {
    name: "buster-coverage",

    create: function (options) {
        var instance = Object.create(this);

        instance.outputDirectory = options.outputDirectory || 'coverage';
        instance.format = options.format || 'lcov';
        instance.combinedResultsOnly = options.combinedResultsOnly || false
        return instance;
    },

    configure: function (config) {
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
        var results = [];
        var basePath = this.outputDirectory; //TODO: Make this safe
        var format = this.format;
        var combinedResultsOnly = this.combinedResultsOnly;

        testRunner.on('coverage:report', function (result) {
            if (!combinedResultsOnly) {
                if (format === 'lcov') {
                    fs.writeFileSync(path.join(basePath, result.client.toString() + '.lcov'), coverageHelpers.generateLcov(result.data));
                } else {
                    fs.writeFileSync(path.join(basePath, result.client.toString() + '.xml'), coverageHelpers.generateCobertura(result.data));
                }
            }
            results.push(result.data);
        });

        testRunner.on('suite:end', function () {
            var coverage = coverageHelpers.combineResults.apply(this, results);
            if (format === 'lcov') {
                fs.writeFileSync(path.join(basePath, '/coverage.lcov'), coverageHelpers.generateLcov(coverage));
            } else {
                fs.writeFileSync(path.join(basePath, '/coverage.xml'), coverageHelpers.generateCobertura(coverage));
            }
        }.bind(this));

        if (! fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, '755');
        }
    }
};
