gulp-sym
========

> Gulp symlink module

[![Build Status](https://travis-ci.org/soyuka/gulp-sym.svg?branch=master)](https://travis-ci.org/soyuka/gulp-sym)

# Why?

I'm aware that there is another [symlink](https://github.com/ben-eb/gulp-symlink) module for gulp but as of v0.1.0 it didn't fit my needs and seems to get messy (absolute/relative). In this plugin, `paths` are always absolute and resolves from the `cwd` that you might change by passing a vinyl instance to the destination function.

# Installation

```
npm install gulp-sym --save-dev
```

# Usage

## Simple example

```javascript
var symlink = require('gulp-sym')

gulp
	.src('source')
	.pipe(symlink('path/to/link'))

```

## Advanced example

```javascript
var symlink = require('gulp-sym'), p = require('path')

var File = require('gulp-util').File

//Again with some directory use case
gulp
	.src(['path/**/to/some/dir/', '!path/example/to/some/dir'])
	//                     file is a vinyl instance
	.pipe(symlink(function(file) {

		return p.join('my/dest/path', file.relative.split(p.sep)[0])

		// you might also return a vinyl instance if you wanted the cwd to change for example
	
		return new File({cwd: '/home', path: './symlink'})

	}, { force: true })) //use force option to replace existant
```

