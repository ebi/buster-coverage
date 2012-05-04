if ('undefined' !== typeof(require)) {
    var buster = require('buster-core');
}

buster.coverage = buster.coverage || {};

if (typeof module === "object" && typeof require === "function") {
    module.exports = require("./extension");
}
