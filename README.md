gulp-sym
========

[![Build Status](https://travis-ci.org/soyuka/gulp-sym.svg?branch=master)](https://travis-ci.org/soyuka/gulp-sym)
[![Dependency Status](https://david-dm.org/soyuka/gulp-sym.svg)](https://david-dm.org/soyuka/gulp-sym)

> Gulp symlink module

# Why?

I'm aware that there is another [symlink](https://github.com/ben-eb/gulp-symlink) module for gulp but as of v0.1.0 it didn't fit my needs and seems to get messy (absolute/relative). In this plugin, `paths` are always absolute and resolves from the `cwd` that you might change by passing a [vinyl](https://github.com/wearefractal/vinyl) instance to the destination function.

# Installation

```
npm install gulp-sym --save-dev {--production}
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
var symlink = require('gulp-sym')
  , p = require('path')
  , File = require('gulp-util').File

gulp
	.src(['path/**/to/some/dir/', '!path/example/to/some/dir'])
	//file is a vinyl instance
	.pipe(symlink(function(source) {

		//for example link source is my/dest/path/dirname where dirname matches the glob pattern
		return p.join('my/dest/path', source.relative.split(p.sep)[0])

		//you might also return a vinyl instance if you wanted a different cwd
		return new File({cwd: '/home', path: './symlink'})

	}, { force: true })) //use force option to replace existant
```

### Don't do this

:warning: If you're working on more than 1 source, use a function or an array to specify the destination path so `gulp-sym` doesn't override the previous symlink!

Here is a counterexample, `dest` will be a link to `source/path/two` and the first one will not have any symlink!

```javascript
gulp
	.src(['source/path/one', 'source/path/two'])
	.pipe(symlink('dest', {force: true})) //bad shit WILL happen
	
```

### Do this

That's how it should be:
```javascript
gulp
	.src(['source/path/one', 'source/path/two'])
	.pipe(symlink(['dest/one', 'dest/two']))
	
```
or through a function that'll be called on each source 

```javascript
gulp
	.src(['source/path/one', 'source/path/two'])
	.pipe(symlink(function(source) {
		return p.resolve(source.path, '../../dest', p.basename(source.path))
	})

```

