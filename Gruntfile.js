/*global module:false*/
module.exports = function(grunt) {

    //load matchdep module
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Project configuration
    grunt.initConfig({
        //Metadata
        pkg: grunt.file.readJSON('package.json'),
        gruntfile: 'Gruntfile.js',
        banner:'/**\n' +
                ' * ! <%= pkg.name %> - v<%= pkg.version %>\n' +
                ' * <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> | <%= pkg.author.name %>;\n' +
                '**/\n',

        //Task configuration
        uglify: {
            options: {
                files: {
                    '<%= pkg.name %>.min.js' : ['<%= pkg.name %>.js']
                }
            }
        },

          jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                expr: true,
                latedef: true,
                onevar: true,
                noarg: true,
                node: true,
                trailing: true,
                undef: true,
                unused: true,
                browser: true,
                newcap: true,
                immed: true,
                forin: true,
                indent: 4,
                quotmark: true,
            }
        },

        build: {

            tasks: ['default'],
            packageConfig: 'pkg',
            packages: '*.json',
            jsonSpace: 2,
            jsonReplacer: undefined
        }
    });

    // Default task
    grunt.registerTask('default', ['jshint', 'uglify']);
};
