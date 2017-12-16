const pg = require('pg');
const connectionString = "postgres://postgres:postgres@localhost:5432/test1"

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
    "INSERT INTO users(id,user_name, password) values($1, $2, $3)", [1, "sharath", "a123@"]);
// "SELECT * from items;");
//'CREATE TABLE users(id SERIAL PRIMARY KEY, user_name VARCHAR(40) not null, password VARCHAR(40) not null)');
query.on('end', () => { client.end(); });

console.log(query);