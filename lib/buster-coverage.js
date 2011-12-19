if ('undefined' !== typeof(require)) {
    var buster = require('buster-core');
}

(function (B) {
    buster.coverage = buster.coverage || {};

    if (buster.bayeuxEmitter) {
        B.testRunner.on('suite:end', function () {
            var bayeuxEmitter =  buster.bayeuxEmitter.create(buster);
            bayeuxEmitter.emit('coverage:lines', _$Coverage);
        });
    }

    if ('undefined' !== typeof(require)) {
        buster.coverage.configure = require("./buster-extension");
    }

}(buster));

if (typeof module != "undefined") {
    module.exports = buster.coverage;
}
