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

  it('should throw with no destination symlink', function(cb) {
    try {
      var stream = symlink()
    } catch(e) {
      expect(e).not.to.be.null
      expect(e.message).to.contain('Missing destination link')
      cb()
    }
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

  it('should emit error because symlink exists', function(cb) {
    var dest = './test/fixtures/links/test'
      , stream = symlink(dest)

    stream.on('data', function(newFile){ 
      expect(newFile).to.equal(file)
    })
    
    stream.once('end', function() {
      cb()
    })

    stream.on('error', function(e) {
      expect(e).not.to.be.null
      expect(e.message).to.contain('Destination file exists')
    })

    stream.write(file)
    stream.end()

  })

  it('should overwrite symlink', function(cb) {
    var dest = './test/fixtures/links/test'
      , stream = symlink(dest, {force: true})

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

  it('should symlink 2 sources to 2 different destinations [array]', function(cb) {

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


  it('should symlink 2 sources to 2 different destinations [function]', function(cb) {

    var dests = ['./test/fixtures/links/test', './test/fixtures/links/test_dir']
    var i = 0
    var stream = symlink(function(source) {
      i++ //make sure this is called 2 times
      return p.resolve(source.path, '../../fixtures/links', p.basename(source.path))
    })

    stream.on('data', function(data) {
    })

    stream.on('end', function() {

      for(var j in dests)
        expect(fs.existsSync(dests[j])).to.be.true

      expect(i).to.equal(2)

      async.map(dests, rm, cb)
    })

    stream.write(file)
    stream.write(dir)
    stream.end()
  })

  //Do we really want 100% coverage?

  it('should emit an error on symlink creation', function(cb) {

    fs.mkdirSync('./test/fixtures/badlinks', 600)

    var dest = './test/fixtures/badlinks/test'
      , stream = symlink(dest)

    stream.on('data', function(newDir){ })

    stream.once('end', function() {
      rm.sync('./test/fixtures/badlinks')

      //windows fs.mkdirSync has wrong rights, I'm cheating there...
      if(require('os').platform() == 'win32')
        cb()
    })

    stream.on('error', function(e) {
      expect(e).not.to.be.null
      expect(e).to.be.an.instanceof(Error)
      cb()

    })

    stream.write(dir)
    stream.end()

  })

})
