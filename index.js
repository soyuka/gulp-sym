var through = require('through2')
  , fs = require('fs')
  , p = require('path')
  , rm = require('rimraf')
  , mkdirp = require('mkdirp')
  , gutil = require('gulp-util')
  , PluginError = gutil.PluginError
  , File = gutil.File

  , PLUGIN_NAME = 'gulp-sym'

// Plugin level function(dealing with files)
function gulpSymlink(dest, options) {

  options = typeof options == 'object' ? options : {}
  options.force = options.force === undefined ? false : options.force

  if (!dest) {
    throw new PluginError(PLUGIN_NAME, "Missing destination link")
  }

  // Creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, callback) {

    var self = this

    file.path = p.resolve(file.cwd, file.path)

    dest = typeof dest == 'function' ? dest(file) : dest

    dest = dest instanceof File ? dest : new File({path: dest})

    dest.path = p.resolve(dest.cwd, dest.path)

    var exists = fs.existsSync(dest.path)

    if(exists && !options.force) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Destination file exists - use force option to replace', dest))
      this.push(file)
      return callback()

    } else {

      if(exists && options.force === true)
        rm.sync(dest.path)

      if(!fs.existsSync(p.dirname(dest.path)))
        mkdirp.sync(p.dirname(dest.path))
      
      file.stat = fs.statSync(file.path)

      //                                windows compatibility
      fs.symlink(file.path, dest.path, file.stat.isDirectory() ? 'dir' : 'file', function(err) {

        if(err)
          self.emit('error', new PluginError(PLUGIN_NAME, err), file)
        else
          gutil.log(PLUGIN_NAME + ':', gutil.colors.gray(file.path), '→', gutil.colors.yellow(dest.path))

        self.push(file) 
        return callback()
      })
    
    }    

  })

  // returning the file stream
  return stream
}

// Exporting the plugin main function
module.exports = gulpSymlink
