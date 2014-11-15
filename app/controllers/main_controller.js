module.exports = {

  index: function(req, res) {
    res.render('index', {
      title: 'Beta'
    });
  },

  about: function(req, res) {
    res.render('about', {
      title: 'About'
    });
  }

};
