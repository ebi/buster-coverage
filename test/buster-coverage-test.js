var buster = require("buster");
var resources = require("buster-resources");
var extension = require("../lib/buster-coverage");

buster.testCase("buster-coverage extension", {
    setUp: function () {
        this.config = buster.eventEmitter.create();
        this.resourceSet = resources.resourceSet.create();

        this.resourceSet.addResource({
            path: "/src/foo.js",
            content: "var foo = 42;"
        });
        this.resourceSet.loadPath.append("/src/foo.js");

        this.resourceSet.addResource({
            path: "/zar.js",
            content: "zar = 2;"
        });
        this.resourceSet.loadPath.append("/zar.js");
    },
    "ensure all default properties exists and default values set if not changed on setup of extension": function () {
        extension = extension.create(this.config);

        assert.hasOwnProperty(extension.outputDirectory);
        assert.match(extension.outputDirectory, 'coverage');
        assert.hasOwnProperty(extension.format);
        assert.match(extension.format, 'lcov');
        assert.hasOwnProperty(extension.combinedResultsOnly);
        assert.isFalse(extension.combinedResultsOnly);
    },

    "ensure extension accept a change in outPutDirectory": function () {
        extension = extension.create(this.config);

        extension.outputDirectory = 'awesome-coverage-testsresults';
        extension.configure(this.config);
        assert.hasOwnProperty(extension, 'outputDirectory');
        assert.match(extension.outputDirectory, 'awesome-coverage-testsresults');
    },

    "ensure extension doesn't accept null or empty string for outputDirectory, but falls back to default": function () {
        this.config.outputDirectory = null;
        extension = extension.create(this.config);
        extension.configure(this.config);
        assert.hasOwnProperty(extension.outputDirectory);
        assert.match(extension.outputDirectory, 'coverage');
        refute.equals(extension.outputDirectory, this.config.outputDirectory);
    },

    "ensure load:sources adds hooks for addProcessor for instrumenting sources": function () {
        extension.configure(this.config);

        this.resourceSet.forEach(function (resource) {
            assert.isFalse(resource.hasProcessors());
        });

        this.config.emit("load:sources", this.resourceSet);

        this.resourceSet.forEach(function (resource) {
            assert.isTrue(resource.hasProcessors());
        });
    },

    "ensure processor for instrumenting sources skips coverage exclusions": function () {
        this.config.coverageExclusions = ['templates'];
        extension = extension.create(this.config);

        this.resourceSet.addResource({
            path: "/src/module/templates/bar.html",
            content: "<html></html>",
            encoding: "utf-8"
        });
        this.resourceSet.loadPath.append("/src/module/templates/bar.html");

        extension.configure(this.config);
        this.config.emit("load:sources", this.resourceSet);

        var resource = this.resourceSet.get("/src/module/templates/bar.html");
        resource.process().then(function (processor_content) {
            assert.match(processor_content, '<html></html>');
        });

        resource.content().then(function (content) {
            assert.match(content, '<html></html>');
        });

    },

    "ensure processor for instrumenting runs on /src/foo.js": function () {
        extension.configure(this.config);
        this.config.emit("load:sources", this.resourceSet);

        this.resourceSet.get("/src/foo.js")
            .process().then(function (processorContent) {
                assert.match(processorContent, '/src/foo.js", 1);');
            });
    }

});