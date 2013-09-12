module.exports = function(grunt) {


    var project_js_files = ['./src/js/**/*.js','!./src/js/libs/**/*.js','./src/js/libs/*.js','!./src/js/foxympd.js','./src/templates/**/*.tpl','./tests/**/*.js','!./tests/vendor/**/*.js'];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    jshint: {
        all: project_js_files.concat(['!./**/*.tpl'])
    },

    watch: {
     scripts: {
        files: project_js_files,
        //tasks: ['connect','mocha_phantomjs:all']
        tasks: ['build','connect','mocha_phantomjs:all']
      },
      css: {
        files: '**/*.scss',
        tasks: ['compass']
      }
    },

    compass: {
        dist: {
          options: {
            cssDir : "src/css",
            fontsDir : "src/fonts",
            sassDir : "src/scss/sass",
            httpFontsPath : "/foxy/fonts",
            imagesDir : "src/imgs",
            javascriptsDir : "src/js",
            environment:"development"
          }
        }
    },

    connect: {
      server: {
        options: {
          port: 8765,
          base: '.'
        }
      }
    },

    copy: {
        "main":  {
            files:[
                {src:['src/js/foxympd.js'],dest:'build/js/main.js'},
                {cwd:'src/',expand:true,src:['js/libs/require/require.js'],dest:'build/'},
                {cwd:'src/',expand:true,src:['css/**'],dest:'build/'},
                {cwd:'src/',expand:true,src:['fonts/**'],dest:'build/'},
                {cwd:'src/',expand:true,src:['imgs/**'],dest:'build/'},
                {expand:true,cwd:'src/',src:['./*'],dest:'build/',filter:'isFile'}
            ]
            }

    },

    clean: ['build','src/js/foxympd.js','src/css/screen.css'],

    requirejs: {

        options: {
            name: "main",
            baseUrl: "src/js",
            mainConfigFile: "src/js/main.js"
        },

        compile: {
            options:{
                optimize:"none",
                out: "src/js/foxympd.js"
            }
        }
    

    },


  mocha_phantomjs: {
    travis: {
      options: {
        urls: [
          'http://localhost:8765/tests/foxympd.html'
        ]
      }
    },
    ci: {
      options: {
        reporter:'xunit',
        'output': 'results.xml',
        urls: [
          'http://localhost:8765/tests/foxympd.html'
        ]
      }
    },
    all: {
      options: {
        urls: [
          'http://localhost:8765/tests/foxympd.html'
        ]
      }
    }
  },

    compress: {
      main: {
        options: {
          archive: 'foxympd.zip'
        },
        files: [
          {expand: true, cwd: 'build/', src: ['**'], dest: ''}
        ]
      }
    }

  });



  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('build', ['clean','requirejs','compass','copy']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('marketplace', ['build','compress']);
  grunt.registerTask('travis', ['test','build','compress']);
  grunt.registerTask('test', ['connect','mocha_phantomjs:travis']);

};
