if (typeof module === "object" && typeof require === "function") {
    var buster = require("buster-test");
}

buster.testRunner.onCreate(function (runner) {
    runner.on('suite:end', function () {
        buster.emit('coverage:report', _$Coverage);
    });
});
