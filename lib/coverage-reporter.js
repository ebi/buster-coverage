if (typeof module === "object" && typeof require === "function") {
    var buster = require("buster");
}

buster.testRunner.onCreate(function (runner) {
    runner.on('suite:end', function () {
        console.log('Suite ended')
        runner.emit('coverage:report', _$Coverage);
    });
});
