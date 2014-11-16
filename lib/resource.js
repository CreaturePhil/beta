var isUser = require('../config/passport').isUser;

module.exports = function Resource(path, controller, router) {
  var id = '/' + (controller['id'] || ':id');
  if (controller['index']) {
    router.get(path, controller['index']);
  }
  if (controller['new']) {
    router.get(path + '/new', controller['new']);
  }
  if (controller['create']) {
    router.post(path, controller['new']);
  }
  if (controller['show']) {
    router.get(path + id, controller['show']);
  }
  if (controller['edit']) {
    router.get(path + '/edit' + id, controller['edit']);
  }
  if (controller['update']) {
    router.put(path + id, isUser, controller['update']);
  }
  if (controller['delete']) {
    router.delete(path + id, controller['delete']);
  }
}

/**
 * Pre-defined action ordering.
 */

//var orderedActions = [
//  'index',    //  GET     /
//  'new',      //  GET     /new
//  'create',   //  POST    /
//  'show',     //  GET     /:id
//  'edit',     //  GET     /edit/:id
//  'update',   //  PUT     /:id
//  'destroy'   //  DELETE  /:id
//];

/**
 * Expose `Resource`.
 */

//module.exports = Resource;

/**
 * Initialize a new `Resource` with the given `name` and `actions`.
 *
 * @param {String} name
 * @param {Object} actions
 * @param {Object} Router
 */

//function Resource(name, actions, router) {
//  actions = actions || {};
//  var id = actions.id || 'id';
//
//  // default actions
//  for (var i = 0, key, len = orderedActions.length; i < len; ++i) {
//    key = orderedActions[i];
//    if (actions[key]) mapDefaultAction(name, key, actions[key], router);
//  }
//}

/**
 * Map the given action `name` with a callback `fn()`.
 *
 * @param {String} key
 * @param {Function} fn
 * @param {Router} router
 */

//function mapDefaultAction(name, key, fn, router) {
//  switch (key) {
//    case 'index':
//      fn || router.get(name, fn);
//      break;
//    case 'new':
//      fn || router.get(name + '/new', fn);
//      break;
//    case 'create':
//      fn || router.post(name, fn);
//      break;
//    case 'show':
//      fn || router.get(name + id,fn);
//      break;
//    case 'edit':
//      fn || router.get(name + id + '/edit', fn);
//      break;
//    case 'update':
//      fn || router.put(name + id, isUser, fn);
//      break;
//    case 'destroy':
//      fn || router.delete(name + id, fn);
//      break;
//  }
//}
