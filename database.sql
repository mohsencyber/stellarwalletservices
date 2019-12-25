create table assets   ( assetissuer varchar(60), assetcode varchar(20));

create table sessions ( ticket varchar(200),sms varchar(10),
			timereq TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
			id varchar(200) ,
			mobilenumber nvarchar(100) , 
			nationalcode nvarchar(100) PRIMARY KEY,
			fullname nvarchar(255),
			accountid varchar(60) );

create table users    ( id varchar(60) PRIMARY KEY ,
			nationalcode nvarchar(100) PRIMARY KEY,
			username nvarchar(100),
		        domain varchar(40),
			mobilenumber nvarchar(100),
			email nvarchar(100),
			fullname nvarchar(255)
			);
create table validsource ( id INT(4) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			   accountid varchar(60));


