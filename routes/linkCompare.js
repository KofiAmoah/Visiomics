var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('linkCompare', {
  		title: 'Visiomics | LinkCompare'
  	});
});

router.post('/linkCompare', function(req, res) {
	res.sendFile('/examples/continuous.html')
});

module.exports = router;
