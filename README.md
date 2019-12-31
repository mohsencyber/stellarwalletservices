# stellarwalletservices

host service for Walletstellar with nodejs

depend on mysql server:

   create database federation;
   
   grant all privileges on federation.* to '<user_name>'@'%' identified by '<password>';
   

use database.sql for create tables

build docker :

  docker build -t walletservice .

run docker:
  
  docker run -p 3000:3000 -e DB_HOST='<ip_mysql_server>' -e DB_USER='<user_name>' -e DB_PASS='<password>' --name wallethost -d walletservice


