//Wrapper function with one parameter
module.exports = function(grunt) {
   grunt.initConfig({
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
   grunt.registerTask('default', ['jshint']);
};
