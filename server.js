require('dotenv').config();
const app = require('./server/app');

app.listen(app.get('port'), () => {
  console.log(`Listening on port ${app.get('port')}`);
});
