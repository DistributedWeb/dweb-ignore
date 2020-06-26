var fs = require('fs')
var path = require('path')
var test = require('tape')

var datIgnore = require('..')

test('default ignore with dir', function (t) {
  var ignore = datIgnore(__dirname)
  checkDefaults(t, ignore)

  // DWeb Ignore stuff
  t.ok(ignore(path.join(__dirname, 'index.js')), 'full path index.js is ignored by .datignore')

  t.end()
})

// test('ignore from within hidden folder', function (t) {
//   var dir = path.join(__dirname, '.hidden')
//   var ignore = datIgnore(dir)
//   checkDefaults(t, ignore)
//   t.notOk(ignore(path.join(dir, 'index.js')), 'file allowed inside hidden')

//   t.end()
// })

test('custom ignore extends default (string)', function (t) {
  var ignore = datIgnore(__dirname, { ignore: '**/*.js' })
  t.ok(ignore('.dweb'), '.dweb folder ignored')
  t.ok(ignore('foo/bar.js'), 'custom ignore works')
  t.notOk(ignore('foo/bar.txt'), 'txt file gets to come along =)')
  t.end()
})

test('custom ignore extends default (array)', function (t) {
  var ignore = datIgnore(__dirname, { ignore: ['super_secret_stuff/*', '**/*.txt'] })
  t.ok(ignore('.dweb'), '.dweb still feeling left out =(')
  t.ok(ignore('password.txt'), 'file ignored')
  t.ok(ignore('super_secret_stuff/file.js'), 'secret stuff stays secret')
  t.notOk(ignore('foo/bar.js'), 'js file joins the party =)')
  t.end()
})

test('ignore hidden option turned off', function (t) {
  var ignore = datIgnore(__dirname, { ignoreHidden: false })

  t.ok(ignore('.dweb'), '.dweb still feeling left out =(')
  t.notOk(ignore('.other-hidden'), 'hidden file NOT ignored')
  t.notOk(ignore('dir/.git'), 'hidden folders with dir NOT ignored')
  t.end()
})

test('useDatIgnore false', function (t) {
  var ignore = datIgnore(__dirname, { useDatIgnore: false })
  t.ok(ignore('.dweb'), '.dweb ignored')
  t.notOk(ignore(path.join(__dirname, 'index.js')), 'file in datignore not ignored')
  t.end()
})

test('change datignorePath', function (t) {
  var ignore = datIgnore(path.join(__dirname, '..'), { datignorePath: path.join(__dirname, '.datignore') })
  t.ok(ignore('.dweb'), '.dweb ignored')
  t.ok(ignore(path.join(__dirname, '..', 'index.js')), 'file in datignore ignored')
  t.end()
})

test('datignore as buf', function (t) {
  var ignore = datIgnore(__dirname, { datignore: fs.readFileSync(path.join(__dirname, '.datignore')) })
  t.ok(ignore('.dweb'), '.dweb ignored')
  t.ok(ignore(path.join(__dirname, 'index.js')), 'file in datignore ignored')
  t.end()
})

test('datignore as str', function (t) {
  var ignore = datIgnore(__dirname, { datignore: fs.readFileSync(path.join(__dirname, '.datignore'), 'utf-8') })
  t.ok(ignore('.dweb'), '.dweb ignored')
  t.ok(ignore(path.join(__dirname, 'index.js')), 'file in datignore ignored')
  t.end()
})

test('well-known not ignored', function (t) {
  var ignore = datIgnore(__dirname)
  t.notOk(ignore(path.join(__dirname, '.well-known/dweb')), 'well known dweb not ignored')
  t.end()
})

test('node_modules ignored', function (t) {
  var ignore = datIgnore(path.join(__dirname, '..'), { datignorePath: path.join(__dirname, '.datignore') })
  t.ok(ignore(path.join(__dirname, 'node_modules')), 'node_modules ignored')
  t.end()
})

test('node_modules subdir ignored', function (t) {
  var ignore = datIgnore(path.join(__dirname, '..'), { datignorePath: path.join(__dirname, '.datignore') })
  t.ok(ignore(path.join(__dirname, 'node_modules', 'dweb')), 'node_modules subdir ignored')
  t.end()
})

test('node_modules file ignored', function (t) {
  var ignore = datIgnore(path.join(__dirname, '..'), { datignorePath: path.join(__dirname, '.datignore') })
  t.ok(ignore(path.join(__dirname, 'node_modules', 'dweb', 'hello.txt')), 'node_modules subdir ignored')
  t.end()
})

test('throws without directory option', function (t) {
  t.throws(function () {
    datIgnore({ opts: true })
  })
  t.end()
})

function checkDefaults (t, ignore) {
  // Default Ignore
  t.ok(
    ['.dweb', '/.dweb', '.dweb/', 'sub/.dweb'].filter(ignore).length === 4,
    'always ignore .dweb folder regardless of /')
  t.ok(
    ['.dweb/foo.bar', '/.dweb/foo.bar', '.dweb/dir/foo'].filter(ignore).length === 3,
    'files in .dweb folder ignored')
  t.ok(ignore('.DS_Store'), 'no thanks DS_Store')

  // Hidden Folder/Files Ignored
  t.ok(
    [
      '.git', '/.git', '.git/',
      '.git/sub', '.git/file.txt', 'dir/.git', 'dir/.git/test.txt'
    ].filter(ignore).length === 7, 'files in .dweb folder ignored')

  // DWeb Ignore stuff
  t.ok(ignore('.datignore'), 'let .datignore through')

  // Things to Allow
  t.notOk(ignore('folder/asdf.data/file.txt'), 'weird data folder is ok')
  t.notOk(
    ['file.dweb', 'file.dweb.jpg', 'the.dweb-thing'].filter(ignore).length !== 0,
    'does not ignore files/folders with .dweb in it')
}
