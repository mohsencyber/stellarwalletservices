
const MySql =  require('mysql');

const  DbCon = MySql.createPool({ 
	//MySql.createConnection({
	host:DB_HOST,
        user:DB_USER,
        password:DB_PASS,
        database:"federation"
  });



/*DbCon.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});
*/
console.log(DB_HOST,DB_USER);

module.exports = DbCon;


