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

  if(dest instanceof Array) {
    //copy array because we'll shift values
    var destinations = dest.slice()
  }

  var stream = through.obj(function(source, enc, callback) {

    var self = this

    //resolving absolute path from source
    source.path = p.resolve(source.cwd, source.path)

    //Array of destinations is passed
    dest = destinations !== undefined ? destinations.shift() : dest

    //if dest is a function simply call it
    dest = typeof dest == 'function' ? dest(source) : dest

    //is the previous result a File instance ?
    dest = dest instanceof File ? dest : new File({path: dest})

    //resolving absolute path from dest
    dest.path = p.resolve(dest.cwd, dest.path)

    //check if the destination path exists
    var exists = fs.existsSync(dest.path)

    //No force option, we can't override! 
    if(exists && !options.force) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Destination file exists - use force option to replace', dest))
      this.push(source)
      return callback()

    } else {

      //remove destination if force option
      if(exists && options.force === true)
        rm.sync(dest.path) //I'm aware that this is bad \o/

      //create destination directories
      if(!fs.existsSync(p.dirname(dest.path)))
        mkdirp.sync(p.dirname(dest.path))
      
      //this is a windows check as specified in http://nodejs.org/api/fs.html#fs_fs_symlink_srcpath_dstpath_type_callback
      source.stat = fs.statSync(source.path)

      fs.symlink(source.path, dest.path, source.stat.isDirectory() ? 'dir' : 'file', function(err) {

        if(err)
          self.emit('error', new PluginError(PLUGIN_NAME, err), source)
        else
          gutil.log(PLUGIN_NAME + ':', gutil.colors.gray(source.path), '→', gutil.colors.yellow(dest.path))

        self.push(source) 
        return callback()
      })
    
    }    

  })

  return stream
}

module.exports = gulpSymlink
