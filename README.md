# buster-coverage

An extension for [buster.js](http://busterjs.org) to generage lcov files for everything listed in your `source` files. You will need [lcov](http://ltp.sourceforge.net/coverage/lcov.php) or something similar to generate meaningful reports.

It will output a `coverage.lcov` that combines all browser into a single file and a separated file for each client that was connected during the testrun.

## Installation

Not yet released on npm, so go to your `node_modules` directory and clone it:

    git clone git://github.com/ebi/buster-coverage.git

Then link it:

    cd buster-coverage
    npm link

Then add it to your `buster.js` config file:

    config["My tests"] = {
      extensions: [ require("buster-coverage") ]
    };

## Configuration

By default it will write everything into the `coverage` subdirectory.

### Change output directory

    config["My tests"] = {
      extensions: [ require("buster-coverage") ],
      "buster-coverage": {
        outputDirectory: "coverage_reports"
      }
    };

## Generating reports

To generate a basic report you can just run:

    genhtml coverage/coverage.lcov -o report

## License

Copyright 2012, Tobias Ebnöther.

Released under the
[BSD license](http://www.opensource.org/licenses/bsd-license.php).