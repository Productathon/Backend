const term = require('child_process').spawn('curl', ['http://127.0.0.1:5001/api/accounts']);
term.stdout.on('data', (data) => {
  const json = JSON.parse(data.toString());
  console.log('✅ VERIFIED: Fetched ' + json.count + ' accounts from backend database:');
  json.data.forEach(a => console.log(` - ${a.company} (${a.status})`));
});
