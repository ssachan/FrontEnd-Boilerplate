	
var _              = require('lodash'),
    path           = require('path'),
    escapeChar     = process.platform.match(/^win/) ? '^' : '\\',
    cwd            = process.cwd().replace(/( |\(|\))/g, escapeChar + '$1'),

 
    lintFiles = {
        // Linting files for server side or shared javascript code.
        web: {
            files: {
                src: [
                    '*.js',
                    'src/app.js'
                ]
            }
        }
        // will add another object for mobile when we get there. 
    },


configureGrunt = function(grunt) {
	grunt.initConfig({
	// Allows us to refer to the values of properties within our package.json (Refer:http://gruntjs.com/sample-gruntfile)
	pkg: grunt.file.readJSON('package.json'),
            // ### grunt-contrib-watch
            // Watch files and livereload in the browser during development.
            // See the [grunt dev](#live%20reload) task for how this is used.
            watch: {
                dev: {
                    files: ['src/*.js','src/*.css'],
                    tasks: ['concat:devjs','concat:devcss']
                },
                // LiveReload monitors changes in the file system. As soon as you save a file,and the browser is refreshed.
                // When you change a CSS file or an image, the browser is updated instantly without reloading the page.
                // Installing respective browser extensions is Optional
                // Check this for more info :
                // http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions-
                livereload: {
                	// Add Specific pathin the array
                    files: [
                    	'src/**/*.css',
                    	'src/*.css',
                        'src/*.html',  
                        'src/**/*.js',
                        'src/*.js',
                    ],
                    options: {
                        livereload: true
                    }
                },
            },	

	// ### grunt-contrib-jshint
	// Linting rules, run as part of `grunt validate`. See [grunt validate](#validate) and its subtasks for
	// More information.
	jshint : (function () {
                return _.merge({
                    web: {
                        options: {
                            jshintrc: '.jshintrc'
                        }
                    },
                }, lintFiles);
            })(),

	
            // ### grunt-jscs
            // Code style rules, run as part of `grunt validate`. See [grunt validate](#validate) and its subtasks for
            // more information.
            jscs: (function () {
                var jscsConfig = _.merge({
                    web: {
                        options: {
                            config: '.jscsrc'
                        }
                    },
                }, lintFiles);
                return jscsConfig;
            })(),


            // ### grunt-shell
            // Command line tools where it's easier to run a command directly than configure a grunt plugin
            shell: {
                // #### Run bower install
                // Used as part of `grunt init`. 
                bower: {
                    command: path.resolve(cwd + '/node_modules/.bin/bower --allow-root install'),
                    options: {
                        stdout: true,
                        stdin: false
                    }
                },
            },      

            // ### grunt-contrib-copy
            // Copy files into their correct locations as part of building assets, or creating release zips
            /*copy: {
                dev: {
                    files: [{
                        cwd: 'bower_components/jquery/',
                        src: 'jquery.js',
                        dest: 'src/built/public/',
                        expand: true
                    }, {
                        cwd: 'bower_components/bootstrap/dist/js',
                        src: 'bootstrap.js',
                        dest: 'src/built/public/',
                        expand: true
                    }]
                },
                prod: {
                    files: [{
                        cwd: 'bower_components/jquery/',
                        src: 'jquery.js',
                        dest: 'src/built/public/',
                        expand: true
                    }, {
                        cwd: 'bower_components/bootstrap/dist/js/',
                        src: 'bootstrap.js',
                        dest: 'src/built/public/',
                        expand: true
                    }]
                },

            },*/ 
            // ### grunt-contrib-concat
            // concatenate multiple JS files into a single file ready for use
            concat: {
                devjs: {
                    nonull: true,
                    dest: 'src/built/vendor-dev.js',
                    src: [
                        'bower_components/jquery/jquery.js',
                        'bower_components/bootstrap/dist/js/bootstrap.js',
                        'bower_components/wow/dist/wow.js',

                        'src/js/*'
                    ]
                },

                devcss: {
                    nonull: true,
                    dest: 'src/built/vendor-dev.css',
                    src: [
                        'bower_components/bootstrap/dist/css/bootstrap.css',

                        'src/css/*'
                    ]
                },

                prodjs: {
                    nonull: true,
                    dest: 'src/built/vendor.js',
                    src: [
                        'bower_components/jquery/jquery.js',
                        'bower_components/bootstrap/dist/js/bootstrap.js',
                        'bower_components/wow/dist/wow.js',

                        'src/js/*'
                    ]
                },

                prodcss: {
                    nonull: true,
                    dest: 'src/built/vendor.css',
                    src: [
                        'bower_components/bootstrap/dist/css/bootstrap.css',

                        'src/css/*'
                    ]
                },
            },
             // ### grunt-contrib-uglify
            // Minify concatenated javascript files ready for production
            uglify: {
                prod: {
                    options: {
                        sourceMap: true
                    },
                    files: {
						'src/built/vendor.min.js': 'src/built/scripts/vendor.js',
                        'src/built/app.min.js': 'src/js/app.js'
                    }
                }
            },
            
            cssmin: {
                prod: {
                    files: [{
                        expand: true,
                        src: ['src/built/vendor.css'],
                        dest: 'src/built',
                        ext: '.min.css'
                    }]
                }
            }

            });

		// Originated with issue #547 grunt/grunt.
		// Load all grunt tasks
		// Find all of the task which start with `grunt-` and load them, rather than explicitly declaring them all
		// require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);
		// Matchdep is a plugin - Install through node package manager

		Object.keys(require('./package.json').devDependencies).forEach(function(devDep) {
  			if(devDep.substring(0,6) == "grunt-") {
   			    grunt.loadNpmTasks(devDep);
 			}
		});


		//** Custom Tasks **

        // ### Init assets
        // `grunt init` - will run an initial asset build for you
        //
        // Grunt init runs `bower install` as well as the standard asset build tasks which occur when you run just
        // `grunt`. This fetches the latest client side dependencies, and moves them into their proper homes.
        //
        // This task is very important, and should always be run and when fetching down an updated code base just after
        // running `npm install`.
        //
        // `bower` does have some quirks, such as not running as root. If you have problems please try running
        // `grunt init --verbose` to see if there are any errors.
        grunt.registerTask('init', 'Prepare the project for development',
            ['shell:bower', 'default']);

        // ### Default asset build
        // `grunt` - default grunt task
        //
        // Compiles concatenates javascript files for the admin UI into a handful of files instead
        // of many files, and makes sure the bower dependencies are in the right place.
        grunt.registerTask('default', 'Build JS & templates for development',
            ['concat:devjs', 'concat:devcss']);

        // ### Live reload
        // `grunt dev` - build assets on the fly whilst developing
        //
        // If you want to live reload for you whilst you're developing, you can do this by running `grunt dev`.
        // This works hand-in-hand with the [livereload](http://livereload.com/) chrome extension.
        //
        // `grunt dev` manages starting an express server and restarting the server whenever core files change (which
        // require a server restart for the changes to take effect) and also manage reloading the browser whenever
        // frontend code changes.
        //
        // Note that the current implementation of watch only works with casper, not other themes.
        grunt.registerTask('dev', 'Dev Mode; watch files',
           ['default','watch']);  

        // ### Lint
        //
        // `grunt lint` will run the linter and the code style checker so you can make sure your code is pretty
        grunt.registerTask('lint', 'Run the code style checks and linter', ['jshint', 'jscs']);

        // ### Release
        // Run `grunt release` to create a release zip file.
        // Uses the files specified by `.npmignore` to know what should and should not be included.
        // Runs the asset generation tasks for both development and production so that the release can be used in
        // either environment, and packages all the files up into a zip.
        grunt.registerTask('release',
            'Release task - creates a final built zip\n' +
            ' - Do our standard build steps \n' +
            ' - Copy files to release-folder/#/#{version} directory\n' +
            ' - Clean out unnecessary files (travis, .git*, etc)\n' +
            ' - Zip files in release-folder to dist-folder/#{version} directory',
            ['init', 'concat:prodjs', 'concat:prodcss', 'cssmin:prod', 'emberBuildProd', 'uglify:release', 'clean:release', 'copy:release', 'compress:release']);

};
// Export the configuration
module.exports = configureGrunt;
