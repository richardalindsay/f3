module.exports = (grunt) ->
    require('load-grunt-tasks') grunt
    require('time-grunt') grunt
    grunt.initConfig
        watch:
            options:
                livereload: true
            coffeeFrontend:
                files: ['src/coffee/public/javascripts/**/*.coffee', 'src/coffee/vendors/javascripts/**/*.js']
                tasks: ['newer:coffee:frontend', 'concat:js', 'uglify', 'clean:js']
            coffeeBackend:
                options:
                    livereload: false
                files: ['src/coffee/**/*.coffee', '!src/coffee/public/javascripts/**']
                tasks: 'newer:coffee:backend'
            sass:
                files: 'src/sass/**/*.sass'
                tasks: ['newer:sass', 'concat:css', 'cssmin', 'clean:css']
            jade:
                files: 'views/**/*.jade'
        coffee:
            frontend:
                expand: true
                cwd: 'src/coffee/public/javascripts'
                src: '**/*.coffee'
                dest: 'public/javascripts'
                ext: '.js'
            backend:
                expand: true
                cwd: 'src/coffee'
                src: ['**/*.coffee', '!**/public/javascripts/**']
                dest: '.'
                ext: '.js'
        concat:
            js:
                options:
                    separator: ';'
                src: ['vendors/javascripts/angular.js', 'vendors/javascripts/angular-route.js', 'vendors/javascripts/angular-highlightjs.js', 'vendors/javascripts/highlight.js', 'public/javascripts/**/*.js']
                dest: 'public/dist/app.js'
            css:
                src: ['vendors/stylesheets/**/*.css', 'public/stylesheets/**/*.css']
                dest: 'public/dist/app.css'
        uglify:
            dist:
                src: 'public/dist/app.js'
                dest: 'public/dist/app.min.js'
        sass:
            compile:
                options:
                    sourcemap: 'none'
                expand: true
                cwd: 'src/sass'
                src: '**/*.sass'
                dest: 'public/stylesheets'
                ext: '.css'
        cssmin:
            dist:
                src: 'public/dist/app.css'
                dest: 'public/dist/app.min.css'
        clean:
            js: ["public/dist/*.js", "!public/dist/*.min.js", "public/javascripts"]
            css: ["public/dist/*.css", "!public/dist/*.min.css", "public/stylesheets"]
        nodemon:
            dev:
                script: './bin/www'
        concurrent:
            target: ['nodemon', 'watch']
            options:
                logConcurrentOutput: true
    grunt.registerTask 'default', 'concurrent'