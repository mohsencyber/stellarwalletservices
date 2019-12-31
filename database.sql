
--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
CREATE TABLE `assets` (
  `assetissuer` varchar(60) DEFAULT NULL,
  `assetcode` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `ticket` varchar(255) DEFAULT NULL,
  `sms` varchar(255) DEFAULT NULL,
  `timereq` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id` varchar(255) DEFAULT NULL,
  `mobilenumber` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `nationalcode` varchar(255) CHARACTER SET utf8 NOT NULL,
  `fullname` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `accountid` varchar(255) DEFAULT NULL,
  `personality` int(2) DEFAULT NULL,
  `corpid` varchar(20) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`nationalcode`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `username` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `mobilenumber` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `nationalcode` varchar(255) CHARACTER SET utf8 NOT NULL,
  `fullname` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `personality` int(2) DEFAULT NULL,
  `corpid` varchar(20) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personality` (`personality`,`nationalcode`,`corpid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `validsource`
--

DROP TABLE IF EXISTS `validsource`;
CREATE TABLE `validsource` (
  `accountid` varchar(255) DEFAULT NULL,
  `id` int(4) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
