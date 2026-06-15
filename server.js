const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

// Live Activity Feed — git log as JSON
app.get('/api/activity', (req, res) => {
  exec('git log --oneline -30 --format=\'{"hash":"%h","message":"%s","author":"%an","date":"%aI"}\'', { cwd: __dirname }, (err, stdout, stderr) => {
    if (err || stderr) {
      // Fallback: serve static git-log.json
      const fallbackPath = path.join(__dirname, 'public', 'git-log.json');
      if (fs.existsSync(fallbackPath)) {
        return res.sendFile(fallbackPath);
      }
      return res.json([{hash:'init', message:'Agent initialized', author:'Angel Eyes AI', date:new Date().toISOString()}]);
    }
    const lines = stdout.trim().split('\n').filter(l => l.trim());
    const commits = lines.map(l => {
      try { return JSON.parse(l); } catch(e) { return null; }
    }).filter(c => c !== null);
    res.json(commits);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Angel Eyes server running on port ${PORT}`);
});
