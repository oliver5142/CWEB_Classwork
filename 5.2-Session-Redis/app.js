const express = require('express');
const hbs = require('hbs');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// redis imports
const { createClient } = require('redis');
const { RedisStore } = require('connect-redis');  

const app = express();
const PORT = 5000;

// Redis client
const redisClient = createClient({
  url: 'redis://host.docker.internal:6379' // in devcontainer use 'redis://host.docker.internal:6379'
});

// Redis session store
const redisSessionStore = {
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key-change-me',
    cookie: { 
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 // 1 hour
    }
}

// Handlebars Views setup
app.set('views', './views');
app.set('view engine', 'hbs');


// Middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session(redisSessionStore));



// Login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submit
app.post('/login', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.render('login', { error: 'Username is required' });
  }

  // Save user in session
  req.session.user = { username };
  res.redirect('/dashboard');
});

// Dashboard (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.session.user });
});

// Logout
app.post('/logout', (req, res) => {
  // redis is on different server therefore async
  // so use a calback function when destroying the session
  req.session.destroy(err => {
    if (err) return res.send('Error logging out');

    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// redis is on different server therefore async 
(async ()=>{
  try {
      // wait for connection to redis server
      await redisClient.connect();
      console.log('Connected to Redis successfully.');

      // then start the express web server
      app.listen(PORT, () => {
          console.log(`Server running on http://localhost:${PORT}`);
      });
  } catch (err) {
      console.error('Failed to start server due to Redis connection error:', err);
      process.exit(1);
  }  
})();