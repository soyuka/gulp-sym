var expect = require('chai').expect
  , fs = require('fs')
  , p = require('path')
  , gutil = require('gulp-util')
  , symlink = require('../')
  , file, dir
  , rm = require('rimraf')
  , async = require('async')

describe('gulp-symlink', function() {

	before(function() {
		file = new gutil.File({
			path: './test/fixtures/test',
			base: './test/fixtures/',
		})
		dir = new gutil.File({
			path: './test/fixtures/test_dir',
			base: './test/fixtures/',
		})
	})

	it('should symlink file', function(cb) {
		var dest = './test/fixtures/links/test'
          , stream = symlink(dest)

        stream.on('data', function(newFile){
			expect(newFile).to.equal(file)
        })

		stream.once('end', function() {
			
			fs.readFile(dest, function(err, f) {
				expect(err).to.be.null
				expect(f.toString()).to.equal(fs.readFileSync(file.path).toString())

				fs.lstat(dest, function(err, stats) {
					expect(stats.isSymbolicLink()).to.be.true
					cb()
				})

			})
			
		})

		stream.write(file)
		stream.end()
	})

	it('should throw because symlink exists', function(cb) {
		var dest = './test/fixtures/links/test'

		try {
			var stream = symlink(dest)

			stream.write(file)
			stream.end()
		} catch(e) {
			expect(e).not.to.be.null
			expect(e.message).to.contain('Destination file exists')

			cb()
		}
	})

	it('should overwrite symlink', function(cb) {
		var dest = './test/fixtures/links/test'

		var stream = symlink(dest, {force: true})

		stream.on('data', function(newDir){ })

		stream.once('end', function() {
			fs.readFile(dest, function(err, f) {
				expect(err).to.be.null
				expect(f.toString()).to.equal(fs.readFileSync(file.path).toString())

				fs.lstat(dest, function(err, stats) {
					expect(stats.isSymbolicLink()).to.be.true
					
					rm(dest, function() {
						cb()
					})
				})

			})
		})	

		stream.write(file)
		stream.end()

	})

	it('should symlink through File instance', function(cb) {

		var dest = './test/fixtures/links/test'
          , stream = symlink(new gutil.File({cwd: process.cwd(), path: dest}))

		stream.on('data', function(newFile){ })

		stream.once('end', function() {
			fs.readFile(dest, function(err, f) {
				expect(err).to.be.null
				expect(f.toString()).to.equal(fs.readFileSync(file.path).toString())

				fs.lstat(dest, function(err, stats) {
					expect(stats.isSymbolicLink()).to.be.true
					
					rm(dest, function() {
						cb()
					})
				})

			})
		})	

		stream.write(file)
		stream.end()

	})

	it('should symlink a directory', function(cb) {
		var dest = './test/fixtures/links/test'
          , stream = symlink(dest)

        stream.on('data', function(newDir){ })

		stream.once('end', function() {
			
			fs.exists(dest, function(exists) {
				expect(exists).to.be.true

				fs.lstat(dest, function(err, stats) {
					expect(stats.isSymbolicLink()).to.be.true

					fs.stat(dest, function(err, stats) {
						expect(stats.isDirectory()).to.be.true

						rm(dest, function() {
							cb()
						})
					})
				})

			})
			
		})

		stream.write(dir)
		stream.end()
	})

	it('should symlink within a non-existent directory', function(cb) {
		var dest = './test/fixtures/links/test/directory/symlink'
		//testing function call
		var stream = symlink(function(file) {
			return p.resolve(file.path, '../../fixtures/links/test/directory/symlink') 
          })

        stream.on('data', function(newFile){
			expect(newFile).to.equal(file)
        })

		stream.once('end', function() {
			
			fs.readFile(dest, function(err, f) {
				expect(err).to.be.null
				expect(f.toString()).to.equal(fs.readFileSync(file.path).toString())

				fs.lstat(dest, function(err, stats) {
					expect(stats.isSymbolicLink()).to.be.true

					rm('./test/fixtures/links/test', function() {
						cb()
					})
				})

			})
			
		})

		stream.write(file)
		stream.end()
	})

	it('should symlink 2 sources to 2 different destinations', function(cb) {

		var dests = ['./test/fixtures/links/test', './test/fixtures/links/test_dir']

		var stream = symlink(dests)

		stream.on('data', function(data) {
		})

		stream.on('end', function() {

			for(var j in dests)
				expect(fs.existsSync(dests[j])).to.be.true

			async.map(dests, rm, cb)
		})

		stream.write(file)
		stream.write(dir)
		stream.end()
	})

})
