/*
 Navicat Premium Data Transfer

 Source Server         : localhost_mysql
 Source Server Type    : MySQL
 Source Server Version : 50642
 Source Host           : localhost:6006
 Source Schema         : blog

 Target Server Type    : MySQL
 Target Server Version : 50642
 File Encoding         : 65001

 Date: 16/10/2019 20:32:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article 文章表
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ARTICLE_NAME` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ARTICLE_TP_ID` double DEFAULT NULL,
  `ARTICLE_CONTENT` mediumtext CHARACTER SET utf8mb4,
  `ARTICLE_CLICK` decimal(11,0) DEFAULT '0',
  `ARTICLE_UP` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ARTICLE_MODLE` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ARTICLE_UPDTDT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ARTICLE_SHORT` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ARTICLE_CONTENT_MARKDOWN` text CHARACTER SET utf8mb4,
  `ARTICLE_HTML_NAME` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ARTICLE_COMMENTS` int(11) DEFAULT '0',
  `ARTICLE_ST` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT '1',
  `ARTICLE_KEYWORDS` varchar(45) CHARACTER SET utf8mb4 DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for article_tag 文章标签关系表
-- ----------------------------
DROP TABLE IF EXISTS `article_tag`;
CREATE TABLE `article_tag` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ARTICLE_ID` int(11) NOT NULL,
  `TAG_ID` int(11) NOT NULL,
  `UPDT_TM` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for article_type 文章类型
-- ----------------------------
DROP TABLE IF EXISTS `article_type`;
CREATE TABLE `article_type` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ARTICLE_TP_ID` int(11) DEFAULT NULL,
  `UPDT_TM` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ARTICLE_TP_NM` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for article_wiki 文章wiki知识树
-- ----------------------------
DROP TABLE IF EXISTS `article_wiki`;
CREATE TABLE `article_wiki` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wiki_id` int(11) DEFAULT NULL,
  `wiki_name` varchar(45) DEFAULT NULL,
  `wiki_pid` int(11) DEFAULT NULL,
  `updt_tm` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `wiki_content` text,
  `wiki_content_md` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idarticle_wiki_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for comment 评论表
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `COMMENT_CONTENT` varchar(500) DEFAULT NULL,
  `CREATE_TIME` varchar(45) NOT NULL,
  `USER_NM` varchar(100) NOT NULL,
  `ARTICLE_ID` int(11) NOT NULL,
  `P_ID` int(11) DEFAULT NULL,
  `REPLY_USER_ID` int(11) DEFAULT NULL,
  `USER_ID` int(11) DEFAULT NULL,
  `EMAIL` varchar(100) DEFAULT NULL,
  `INTERNET_SITE` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for history 版本历史表
-- ----------------------------
DROP TABLE IF EXISTS `history`;
CREATE TABLE `history` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `HISTORY_CONTENT` varchar(500) DEFAULT NULL,
  `HISTORY_DT` timestamp NULL DEFAULT NULL,
  `CREATE_TIME` timestamp NULL DEFAULT NULL,
  `USER_NM` varchar(45) DEFAULT NULL,
  `ST` varchar(1) DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for menu 菜单表
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `MENU_NO` int(11) DEFAULT NULL,
  `MENU_NM` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MENU_PNO` int(11) DEFAULT NULL,
  `MENU_LNK` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UPDATE_TM` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_USR` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for role  角色表
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `ROLE_NO` int(11) NOT NULL AUTO_INCREMENT,
  `ROLE_NM` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UPDATE_TM` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_USR` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ROLE_NO`)
) ENGINE=InnoDB AUTO_INCREMENT=671 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for role_menu 角色菜单表
-- ----------------------------
DROP TABLE IF EXISTS `role_menu`;
CREATE TABLE `role_menu` (
  `ROLE_NO` int(11) NOT NULL,
  `MENU_NO` int(11) NOT NULL,
  `UPDATE_TM` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_USR` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ROLE_NO`,`MENU_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for tag 标签表
-- ----------------------------
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `TAG_ID` int(11) DEFAULT NULL,
  `TAG_NM` varchar(45) DEFAULT NULL,
  `UPDT_TM` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for user 用户表
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `USER_ID` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `USER_PWD` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LAST_LOGIN_TM` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TM` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_USR` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for user_role  用户角色关系表
-- ----------------------------
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role` (
  `ROLE_NO` int(11) NOT NULL,
  `USER_ID` varchar(20) NOT NULL,
  `UPDATE_TM` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_USR` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ROLE_NO`,`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
