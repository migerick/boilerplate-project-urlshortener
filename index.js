require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

let urlDatabase = {}; // In-memory storage for URLs
let urlCounter = 1; // Counter for generating short URLs

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST: Create a short URL
app.post('/api/shorturl', function (req, res) {
  let originalUrl = req.body.url;

  // Validate the URL format
  const urlObject = urlParser.parse(originalUrl);
  if (!urlObject.protocol || !urlObject.host) {
    return res.json({ error: 'invalid url' });
  }

  // Check if domain is valid
  dns.lookup(urlObject.host, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Store URL and return short URL
    let shortUrl = urlCounter++;
    urlDatabase[shortUrl] = originalUrl;
    
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET: Redirect to original URL
app.get('/api/shorturl/:short_url', function (req, res) {
  let shortUrl = req.params.short_url;
  let originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
