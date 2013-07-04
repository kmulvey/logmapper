'use strict';

module.exports = function(grunt) {
	
	// These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
    
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
		banner: 
      '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* <%= pkg.url %>\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.copyright %> ' +
      ' Licensed MIT */'
    },

    qunit: {
        files: ['tests/**/*.html']
    },

    jshint: {
      all: [
        'Gruntfile.js',
        './**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
  });

  // Default task.
  grunt.registerTask('default', ['jshint']);
};
