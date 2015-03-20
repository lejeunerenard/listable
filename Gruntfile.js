//Wrapper function with one parameter
module.exports = function(grunt) {
   grunt.initConfig({
      // pkg is used from templates and therefore
      // MUST be defined inside the initConfig object
      pkg : grunt.file.readJSON('package.json'),

      meta: {
         banner: '/*! <%= pkg.name %> v<%= pkg.version %> - ' +
                 '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
                 ' *  Author: <%= pkg.author %> \n' +
                 ' *  License: <%= pkg.license %>\n' +
                 ' */\n\n'
      },
      // config for jshint
      jshint: {
         options: {
            eqeqeq: true,
            trailing: true
         },
         target: {
            src: ['src/**/*.js']
         }
      },
      // Concat config
      concat: {
         options: {
            separator: '\n\n'
         },
         dist: {
            options: {
               banner: '<%= meta.banner %>'
            },
            src: [
               'src/**/*.js'
            ],
            dest: 'dist/jquery.listable.js'
         }
      },
      copy: {
         css: {
            expand: true,
            cwd: 'src/',
            src: '**/*.css',
            dest: 'dist/',
            flattern: true,
            filter: 'isFile'
         }
      },
      uglify: {
         options: {
            banner: '<%= meta.banner %>'
         },
         dist: {
            files: {
               'dist/jquery.listable.min.js': ['dist/jquery.listable.js']
            }
         }
      }
   });
   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.registerTask('default', ['concat', 'copy', 'uglify']);
   grunt.registerTask('test', ['jshint']);
};
