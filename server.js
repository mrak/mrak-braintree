require('dotenv').config();

const path = require('path');
const app = require(path.resolve(__dirname, './server/app'));

app.listen(app.get('port'), () => {
  console.log(`Listening on port ${app.get('port')}`);
});
