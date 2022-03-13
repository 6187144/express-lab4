var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/tal', function (req, res, next) {
  res.send('respond with a tal');
});
module.exports = router;
