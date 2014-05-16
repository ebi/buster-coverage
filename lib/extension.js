var path = require('path');
var fs = require('fs');
var coverageHelpers = require('coverage-helpers');
var coverageExclusions = [];

function processor(resource, content, rootPath) {
	if (typeof rootPath === 'undefined') {
		rootPath = process.cwd();
	}
    for (var i = 0; i < coverageExclusions.length; i++) {
        if (resource.path.indexOf(coverageExclusions[i]) !== -1) {
            return content;
        }
    }
    var contentBuffer = new Buffer(content, resource.encoding);
    var fullPath = path.join(rootPath, resource.path);
    return coverageHelpers.instrument(contentBuffer, fullPath).toString(resource.encoding);
}

module.exports = {
    name: "buster-coverage",

    create: function (options) {
        var instance = Object.create(this);

        coverageExclusions = options.coverageExclusions || [];

        instance.outputDirectory = options.outputDirectory || 'coverage';
        instance.format = options.format || 'lcov';
        instance.combinedResultsOnly = options.combinedResultsOnly || false;
        return instance;
    },

    configure: function (config) {
        this.config_name = config.name;
        if (typeof config.rootPath !== 'undefined') {
			this.outputDirectory = path.join(config.rootPath, this.outputDirectory);
		}

        config.on('load:sources', function (resourceSet) {
            resourceSet.addProcessor(function (resource, content) {
                return processor(resource, content, resourceSet.rootPath)
            });
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
        var existsSync = fs.existsSync || path.existsSync;
        var config_name = this.config_name;

        testRunner.on('coverage:report', function (result) {
            if (!combinedResultsOnly) {
                //TODO: Make formats extensible…
                if (format === 'lcov') {
                    fs.writeFileSync(path.join(basePath, config_name + '-' + result.client.toString() + '.lcov'), coverageHelpers.generateLcov(result.data));
                } else if (format === 'cobertura') {
                    fs.writeFileSync(path.join(basePath, config_name + '-' + result.client.toString() + '.xml'), coverageHelpers.generateCobertura(result.data));
                } else {
                    throw new Error('Format not supported.');
                }
            }
            results.push(result.data);
        });

        testRunner.on('suite:end', function () {
            var coverage = coverageHelpers.combineResults.apply(this, results);
            if (format === 'lcov') {
                fs.writeFileSync(path.join(basePath, config_name + '-coverage.lcov'), coverageHelpers.generateLcov(coverage));
            } else if (format === 'cobertura') {
                fs.writeFileSync(path.join(basePath, config_name + '-coverage.xml'), coverageHelpers.generateCobertura(coverage));
            } else {
                throw new Error('Format not supported.');
            }
        }.bind(this));

        if (! existsSync(basePath)) {
            fs.mkdirSync(basePath, '755');
        }
    }
};
