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
    throw new PluginError({plugin: PLUGIN_NAME, message: "Missing destination link"})
  }

  if(dest instanceof Array) {
    //copy array because we'll shift values
    var destinations = dest.slice()
  }

  var stream = through.obj(function(source, enc, callback) {

    var self = this, symlink

    //resolving absolute path from source
    source.path = p.resolve(source.cwd, source.path)
    // source.relative = p.relative(source.cwd, source.path)

    //Array of destinations is passed
    symlink = destinations !== undefined ? destinations.shift() : dest

    //if dest is a function simply call it
    symlink = typeof dest == 'function' ? dest(source) : symlink

    //is the previous result a File instance ?
    symlink = symlink instanceof File ? symlink : new File({path: symlink})

    //resolving absolute path from dest
    symlink.path = p.resolve(symlink.cwd, symlink.path)

    //relative path between source and link
    var relative_symlink_source = p.relative(p.dirname(symlink.path), source.path)

    //check if the destination path exists
    var exists = fs.existsSync(symlink.path)

    //No force option, we can't override! 
    if(exists && !options.force) {
      this.emit('error', new PluginError({plugin: PLUGIN_NAME, message: 'Destination file exists ('+dest+') - use force option to replace'}))
      this.push(source)
      return callback()

    } else {

      //remove destination if force option
      if(exists && options.force === true)
        rm.sync(symlink.path) //I'm aware that this is bad \o/

      //create destination directories
      if(!fs.existsSync(p.dirname(symlink.path)))
        mkdirp.sync(p.dirname(symlink.path))
      
      //this is a windows check as specified in http://nodejs.org/api/fs.html#fs_fs_symlink_srcpath_dstpath_type_callback
      source.stat = fs.statSync(source.path)

      fs.symlink(options.relative ? relative_symlink_source : source.path, symlink.path, source.stat.isDirectory() ? 'dir' : 'file', function(err) {

        if(err)
          self.emit('error', new PluginError({plugin: PLUGIN_NAME, message: err}))
        else
          gutil.log(PLUGIN_NAME + ':', gutil.colors.blue(options.relative ? relative_symlink_source : source.path), '→', gutil.colors.yellow(symlink.path))

        self.push(source) 
        return callback()
      })
    
    }    

  })

  return stream
}

module.exports = gulpSymlink
