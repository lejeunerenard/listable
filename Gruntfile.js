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
      // jshint config
      jshint: {
         options: {
            eqeqeq: true,
            trailing: true
         },
         target: {
            src: ['src/**/*.js']
         }
      }
   });
   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.registerTask('default', ['concat']);
   grunt.registerTask('test', ['jshint']);
};
