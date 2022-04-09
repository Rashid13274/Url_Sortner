const express = require('express');
const url=require('../controller/urlController');
const router = express.Router();


router.post('/api/url/shorten',url.postUrl);
router.get('/:code', url.getUrl)


module.exports = router;
