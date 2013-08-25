
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/js/main.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },


    requirejs: {
        compile: {
            options:{
                name: "main",
                baseUrl: "src/js",
                mainConfigFile: "src/js/main.js",
                out: "src/js/foxympd.js"
            }
        }
    
    },

    jst: {
      compile: {
        options: {
        },
        files: {
          "build/templates.js": ["src/templates/**/*.tpl"]
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

};
