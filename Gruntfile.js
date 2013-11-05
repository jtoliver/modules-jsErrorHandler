/*global module:false*/
module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({
        //Metadata
        pkg: grunt.file.readJSON('package.json'),
        gruntfile: 'Gruntfile.js',
        banner:'',

        //Task configuration

        uglify: {
            options: {
                files: {
                    '<%= pkg.name %>.min.js' : ['<%= pkg.name %>.js']
                }
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

    //import plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bump-build-git');

    // Default task
    grunt.registerTask('default', ['uglify']);
};
