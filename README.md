gulp-sym
========

[![Build Status](https://travis-ci.org/soyuka/gulp-sym.svg?branch=master)](https://travis-ci.org/soyuka/gulp-sym)
[![Build status](https://ci.appveyor.com/api/projects/status/al6dv384q7jwgsfs)](https://ci.appveyor.com/project/soyuka/gulp-sym)
[![Dependency Status](https://david-dm.org/soyuka/gulp-sym.svg)](https://david-dm.org/soyuka/gulp-sym)
[![NPM version](https://badge.fury.io/js/gulp-sym.svg)](http://badge.fury.io/js/gulp-sym)
[![Code Climate](https://codeclimate.com/github/soyuka/gulp-sym.png)](https://codeclimate.com/github/soyuka/gulp-sym)
[![Coverage](https://codeclimate.com/github/soyuka/gulp-sym/coverage.png)](https://codeclimate.com/github/soyuka/gulp-sym)

> Gulp symlink module

# Deprecation warning
In favor of https://github.com/ben-eb/gulp-symlink See https://github.com/ben-eb/gulp-symlink/issues/15

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
	//note that it'll return source streams not the symlink ones

```

## Advanced example

```javascript
var symlink = require('gulp-sym')
  , p = require('path')
  , File = require('gulp-util').File

gulp
	.src(['path/**/to/some/dir/', '!path/example/to/some/dir'])
	//source is a vinyl instance
	.pipe(symlink(function(source) {

		//for example link source is my/dest/path/dirname where dirname matches the glob pattern
		return p.join('my/dest/path', source.relative.split(p.sep)[0])

		//you might also return a vinyl instance if you wanted a different cwd
		return new File({cwd: '/home', path: './symlink'})

	}, { force: true })) //use force option to replace existant
```

## Options

- `force` (bool): force overwrite symlink
- `relative` (bool): your link will be relative

### /!\ Don't do this ...

If you're working on more than 1 source, use a function or an array to specify the destination path so `gulp-sym` doesn't override the previous symlink!

Here is a counterexample, `dest` will be a link to `source/path/two` and the first one will not have any symlink!

```javascript
gulp
	.src(['source/path/one', 'source/path/two'])
	.pipe(symlink('dest', {force: true})) //bad shit WILL happen
	
```

### ... but this

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

It's intendend behavior and api will not change for this, I could warn the user in this case - to be discussed.

# Why?

I'm aware that there is another [symlink](https://github.com/ben-eb/gulp-symlink) module for gulp but as of v0.1.0 it didn't fit my needs and seems to get messy (absolute/relative). In this plugin, `paths` are always absolute and resolves from the `cwd` that you might change by passing a [vinyl](https://github.com/wearefractal/vinyl) instance to the destination function.

[gulp-symlink](https://github.com/ben-eb/gulp-symlink) :
- has no force option to replace existing link
- uses [fs.symlink twice](https://github.com/ben-eb/gulp-symlink/blob/master/index.js#L54) instead of using `fs.exists`. I'm aware of the nodejs docs specifying that `fs.exists` is there on an historical purpose only but why shouldn't we use it?
- doesn't use the specified type option mentioned in the [nodejs docs](http://nodejs.org/api/fs.html#fs_fs_symlink_srcpath_dstpath_type_callback) (windows only)
- has no test on symlinking directories (maybe why tests are good to go on windows)
- has bad support on multiple sources (at the moment)

# Licence

MIT
