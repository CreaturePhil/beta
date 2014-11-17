var request = require('supertest');
var app = require('../server.js');

describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /about', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/about')
      .expect(200, done);
  });
});

describe('GET /404', function() {
  it('should return 404 Page Not Found', function(done) {
    request(app)
      .get('/404')
      .expect(404, done);
  });
});

describe('GET /signup', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/signup')
      .expect(200, done);
  });
});

describe('GET /login', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/login')
      .expect(200, done);
  });
});

describe('GET /forgot_password', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/forgot_password')
      .expect(200, done);
  });
});

describe('GET /settings/account', function() {
  it('should return 302 Redirect', function(done) {
    request(app)
      .get('/settings/account')
      .expect(302, done);
  });
});
