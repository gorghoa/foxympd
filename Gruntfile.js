
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
        compile: {
            options:{
                optimize:"none",
                name: "main",
                baseUrl: "src/js",
                mainConfigFile: "src/js/main.js",
                out: "src/js/foxympd.js"
            }
        }
    
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jst');

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Default task(s).
  grunt.registerTask('default', ['requirejs']);
  grunt.registerTask('travis', ['requirejs']);

};
