const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: '.env' });

process.on('uncaughtException', (err) => {
  console.log('Something is not working.Server crashed!!');
  console.log(err.name, err.message);
  process.exit(1);
});

// connecting to database
let DB = process.env.MONGO_LOCAL;

if( !process.env.MONGO_LOCAL ) {
  DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  ).replace(
    '<USERNAME>',
    process.env.DATABASE_USERNAME
  )
}

if( !DB ) {
  console.log('Database not connected!!');
  process.exit(1);
}

mongoose
  // .connect(process.env.DATABASE_LOCAL
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('instantiated...');
});