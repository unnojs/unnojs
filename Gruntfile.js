module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: [
            'dist'
        ],

        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                jshintrc: true
            }
        },

        browserify: {
            dist: {
                src: ['src/unno.js'],
                dest: 'dist/<%= pkg.name %>.js',
                options: {
                    //external: {
                    //    "react": "react"
                    //},
                    browserifyOptions: {
                        standalone: 'Unno'
                    }
                },
            }
        },

        uglify: {
            dist: {
                src: 'dist/unno.js',
                dest: 'dist/unno.min.js'
            }
        },

        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['build']
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('test', ['jshint']);

    grunt.registerTask('build', ['clean', 'browserify', 'uglify']);

    grunt.registerTask('default', ['watch']);
};
