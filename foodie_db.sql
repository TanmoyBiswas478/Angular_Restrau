-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: foodie_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `membership` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Standard',
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (6,'CID1','Sani Shil','sanishil.cse.tcea.2026@gmail.com','+91 7085584348','Siddhiashram, Agartala, Tripura, West Tripura, 799003','Diamond Elite','Customer','$2y$12$o6rWvx9JbawDG7JQT3l.VeNZ3szNqF4jbu2ZiNluaVzRpGVofK/tO','customers/c2SXxtLVNub7vPwvC8wYLNtzEbbp6bNaThjoNJVl.png','2026-08-01 06:23:30','2026-08-12 03:51:50'),(7,'CID2','Tanmoy Biswas','tanmoy.biswas@ilogitron.com','+91 9862402512','Siddhiashram, Agartala, Tripura, West Tripura, 799003','Gold Elite','Customer','$2y$12$dii.7o/1W3iDl1r5SjPBjO4PW2emCpRWs9M5GaO.Xj7LKcAq.9wEC','customers/TrsIiq1It2323lsxmsHoDL9YMkOdhZTYYUoy2QX8.png','2026-08-03 00:04:57','2026-08-24 05:09:16');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliverys`
--

DROP TABLE IF EXISTS `deliverys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliverys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivery_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Unassigned',
  `driver_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_eid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items` text COLLATE utf8mb4_unicode_ci,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Preparing',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliverys`
--

LOCK TABLES `deliverys` WRITE;
/*!40000 ALTER TABLE `deliverys` DISABLE KEYS */;
INSERT INTO `deliverys` VALUES (11,'CID1','ORD1','Sani Shil','Standard Delivery Location','Unassigned',NULL,NULL,'Butter Chicken (x1)',320.00,'Preparing','2026-08-03 23:46:15','2026-08-03 23:46:15'),(12,'CID1','ORD2','Sani Shil','Standard Delivery Location','Unassigned',NULL,NULL,'Butter Chicken (x1), Chicken Dum Biryani Full (x1), Chicken Dum Biryani (x1)',770.00,'Preparing','2026-08-04 00:44:56','2026-08-04 00:44:56'),(13,'CID2','ORD3','Tanmoy Biswas','Standard Delivery Location','Unassigned',NULL,NULL,'Chicken Dum Biryani Full (x1)',250.00,'Delivered','2026-08-04 00:57:00','2026-08-04 00:57:27'),(14,'CID2','ORD4','Tanmoy Biswas','Standard Delivery Location','Unassigned',NULL,NULL,'Chicken Lababdar (x1), Chicken Dum Biryani Full (x1), Butter Chicken (x1)',780.00,'Delivered','2026-08-12 00:20:52','2026-08-12 05:58:36'),(15,'CID1','ORD5','Sani Shil','Standard Delivery Location','Unassigned',NULL,NULL,'Chicken Lababdar (x1)',210.00,'Delivered','2026-08-12 06:00:03','2026-08-12 06:19:00'),(16,'CID2','ORD6','Tanmoy Biswas','Standard Delivery Location','Unassigned',NULL,NULL,'Chicken Lababdar (x1), Chicken Dum Biryani Full (x1)',460.00,'Preparing','2026-08-24 03:58:56','2026-08-24 06:21:38'),(17,'CID2','ORD7','Tanmoy Biswas','Standard Delivery Location','Unassigned',NULL,NULL,'Butter Chicken (x1), Chicken Dum Biryani Full (x1)',570.00,'Out for Delivery','2026-08-24 03:58:59','2026-08-24 06:21:34'),(18,'CID2','ORD8','Tanmoy Biswas','Standard Delivery Location','Unassigned',NULL,NULL,'Chicken Dum Biryani (x1), Chicken Lababdar (x1)',410.00,'Delivered','2026-08-24 03:59:02','2026-08-24 06:04:55');
/*!40000 ALTER TABLE `deliverys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `eid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','On Leave','Resigned','Suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `availability` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Offline',
  `store_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employees_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'EID1','Tanmoy Biswas','Admin','tanmoybiswas478@gmail.com','+91 8258903821','https://scontent.fgau3-2.fna.fbcdn.net/v/t39.30808-6/471568502_1089134652995187_5932619286472339379_n.jpg?stp=c0.169.1536.1536a_dst-jpg_tt6&cstp=mx1536x1536&ctp=s206x206&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=50ad20&_nc_ohc=2mc2NJsatLgQ7kNvwFc4Q86&_nc_oc=Adqgr1Ql93SNz0xAGijUZjeIgPNocSckaXbQXvowGA9jW-upAe0AKv20fFln8ZAAXCNItxakamRS9wvwSajiMZ3h&_nc_zt=23&_nc_ht=scontent.fgau3-2.fna&_nc_gid=TIeGfU18W1wmurbGlT_tIA&_nc_ss=7b289&oh=00_AQFcib6fv1ZuHyZGHvk9M9UcLiBLW6NQQz2sUBrgInoAOA&oe=6A8A000A','Active','Offline',NULL,NULL,'2026-08-18 04:05:26'),(3,'EID2','Sani Shil','Admin','sanishi.cse@gmail.com','+91 7085584347','https://scontent.fgau3-3.fna.fbcdn.net/v/t39.30808-6/359833294_1770203433476417_9138898891038990507_n.jpg?stp=dst-jpg_tt6&cstp=mx768x773&ctp=s768x773&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=oruTKMXsA2oQ7kNvwGqW1sv&_nc_oc=AdpbppPZOXBmtIxsFHuVG4tTwzd3Im8RbO6gGFlgh0ZP96fai9PvajGyA7l-JSc8LCS_Xnp21WKiK2TpOJGK-Cu1&_nc_zt=23&_nc_ht=scontent.fgau3-3.fna&_nc_gid=QA1EaXu6rGTRU-kGQ-iImQ&_nc_ss=7b289&oh=00_AQG7SpR07NXK703WD0URqGVzJm6CFCJ74sFwodWl6xeZOg&oe=6A89F42D','On Leave','Offline',NULL,'2026-08-01 00:00:01','2026-08-18 04:06:32'),(4,'EID3','Nabakallo Deb','Chef','nb@gmail.com','+91 1234567890','https://img.magnific.com/free-photo/horizontal-portrait-smiling-happy-young-pleasant-looking-female-wears-denim-shirt-stylish-glasses-with-straight-blonde-hair-expresses-positiveness-poses_176420-13176.jpg?semt=ais_hybrid&w=740&q=80','Suspended','Offline',NULL,'2026-08-03 01:10:56','2026-08-18 04:13:33'),(5,'EID4','Tanmoy Biswas','Chef','sranit55@gmail.com','+91 6033582559','https://scontent.fgau3-2.fna.fbcdn.net/v/t39.30808-6/471443763_1089134876328498_3462746794980065669_n.jpg?stp=c0.79.720.720a_dst-jpg_tt6&cstp=mx720x720&ctp=s206x206&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=50ad20&_nc_ohc=WtKpWUEsJVUQ7kNvwEnZ3GJ&_nc_oc=AdrB6Z-UtLJp1DpMxLu8wCDzbTtPYbNUbgH4cqwnBEosx0MbaIhnRrR9_xOr1IIISY-KJGGU-gt_fHGPrFYsPji3&_nc_zt=23&_nc_ht=scontent.fgau3-2.fna&_nc_gid=TIeGfU18W1wmurbGlT_tIA&_nc_ss=7b289&oh=00_AQFXuCE_BlGBLiAaX2WYKBTQhbvSFpiZexsg76qWmIwrhA&oe=6A8A049C','Resigned','Offline',NULL,'2026-08-03 04:43:46','2026-08-18 04:13:31'),(6,'EID5','Ab','Store Manager','ab@gmail.com','+91 8787441789','https://instagram.fgau3-1.fna.fbcdn.net/v/t51.82787-15/563117988_18062659439614378_4153605769614379168_n.webp?_nc_cat=107&_nc_map=urlgen_bucketless&ig_cache_key=Mzc0MDA0NjQ5NjU2MjI1NTg3MQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=vVtF8gcWvkwQ7kNvwFE0eaG&_nc_oc=AdprghtKtp2aU8cQ6wFwIWOLq3Npy1_1EHxUp4XGNuHOnd46T7DoHZ2SQgazEbNhA_Y66ajQjv-Q706N6ITytdef&_nc_ad=z-m&_nc_cid=1174&_nc_zt=23&_nc_ht=instagram.fgau3-1.fna&_nc_gid=hDmS23W0U_NrgjAdJMAnxg&_nc_ss=7a22e&oh=00_AQE_Rloh50C77bK5H53mM9Pwkd3UeLXlWa2l-kx8fOTL1g&oe=6A8A144D','Active','Offline',NULL,'2026-08-18 03:31:28','2026-08-18 04:09:59'),(7,'EID201','Ravi Kumar','Delivery Executive','delivery@foodie.test','9000000201',NULL,'Active','Offline',1,'2026-08-24 07:53:21','2026-08-24 07:53:21'),(8,'EID202','Sunita Rao','Store Manager','manager@foodie.test','9000000202',NULL,'Active','Online',1,'2026-08-24 07:53:21','2026-08-24 07:53:21'),(9,'EID203','Amit Das','Kitchen Assistant','kitchen@foodie.test','9000000203',NULL,'Active','Online',1,'2026-08-24 07:53:21','2026-08-24 07:53:21');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_per_unit` decimal(8,2) NOT NULL,
  `quantity` int NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pcs',
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `min_stock_level` int NOT NULL DEFAULT '10',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'In Stock',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventories`
--

LOCK TABLES `inventories` WRITE;
/*!40000 ALTER TABLE `inventories` DISABLE KEYS */;
INSERT INTO `inventories` VALUES (2,'Butter Chicken','Main Course',320.00,9,'pcs','https://static.toiimg.com/thumb/53205522.cms?imgsize=302803&width=800&height=800',10,'Low Stock','2026-08-01 00:49:59','2026-08-24 03:58:59'),(3,'Chicken Dum Biryani Full','Chicken Dum Biryani',250.00,0,'pcs','https://www.licious.in/blog/wp-content/uploads/2022/06/chicken-hyderabadi-biryani-01.jpg',10,'Out of Stock','2026-08-01 00:51:45','2026-08-24 03:58:59'),(4,'Chicken Dum Biryani','Chicken Dum Biryani',200.00,14,'pcs','https://www.licious.in/blog/wp-content/uploads/2022/06/chicken-hyderabadi-biryani-01.jpg',10,'In Stock','2026-08-01 00:53:02','2026-08-24 03:59:02'),(6,'Chicken Lababdar','Gravy Items',210.00,23,'pcs','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr9X_f4NBVuTXhsAS7l0lM1ytlmQLR5Tp2GM-7btGTxQ&s=10',10,'In Stock','2026-08-12 00:19:24','2026-08-24 03:59:02');
/*!40000 ALTER TABLE `inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchenstocks`
--

DROP TABLE IF EXISTS `kitchenstocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchenstocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `eid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ingredient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `minimum_stock_alert` int NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Request',
  `request_item` decimal(10,0) DEFAULT NULL,
  `request_to_admin` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchenstocks`
--

LOCK TABLES `kitchenstocks` WRITE;
/*!40000 ALTER TABLE `kitchenstocks` DISABLE KEYS */;
INSERT INTO `kitchenstocks` VALUES (5,'EID3','Soyabean',37,'kg',2,'Already Requested',0,'Approved','Nabakallo Deb','2026-08-03 06:32:27','2026-08-18 03:17:21'),(6,'EID3','Mirch',5155,'grams',100,'Already Requested',0,'Approved','Nabakallo Deb','2026-08-03 07:21:26','2026-08-18 03:17:23'),(7,'EID3','Potato',30,'kg',5,'Already Requested',0,'Approved','Nabakallo Deb','2026-08-18 02:13:20','2026-08-18 03:17:24');
/*!40000 ALTER TABLE `kitchenstocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id` bigint unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Active','Expired','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `members_email_unique` (`email`),
  KEY `members_plan_id_foreign` (`plan_id`),
  CONSTRAINT `members_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `membership_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership_plans`
--

DROP TABLE IF EXISTS `membership_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership_plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `duration_months` int NOT NULL,
  `discount_percentage` int NOT NULL,
  `benefits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `membership_plans_chk_1` CHECK (json_valid(`benefits`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership_plans`
--

LOCK TABLES `membership_plans` WRITE;
/*!40000 ALTER TABLE `membership_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `membership_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_07_29_083255_create_employees_table',1),(5,'2026_07_29_083838_create_personal_access_tokens_table',1),(6,'2026_07_29_102618_create_inventories_table',1),(7,'2026_07_29_102626_create_deliveries_table',1),(8,'2026_07_29_102633_create_membership_plans_table',1),(9,'2026_07_29_102638_create_members_table',1),(10,'2026_07_29_102643_create_settings_table',1),(11,'2026_07_31_082643_update_avatar_url_length_in_employees_table',1),(12,'2026_07_31_095151_create_customers_table',2),(13,'2026_08_01_064334_create_deliverys_table',3),(14,'2026_08_03_065108_create_kitchenstocks_table',4),(15,'2026_08_03_083441_create_kitchenstocks_table',5),(16,'2026_08_12_062641_update_existing_tables_safely',6),(17,'2026_08_24_100000_add_new_role_fields_safely',7),(18,'2026_08_24_100100_create_stores_table',7);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('tuyG6R4qRQwY4dPTkKinKdZBj4nUPR1Zqpmw5XuM',NULL,'192.168.1.117','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUHZCU0g2dk5NWnBna09SSHNNS2NobEZ3eTJlOEo0MFpXZlY5OHQ4TSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHA6Ly8xOTIuMTY4LjEuMTE3OjEyMzQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1786512807);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Foodie Restro',
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `opening_time` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '09:00 AM',
  `closing_time` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '11:00 PM',
  `currency` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `tax_percentage` decimal(5,2) NOT NULL DEFAULT '5.00',
  `delivery_charge` decimal(8,2) NOT NULL DEFAULT '40.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_eid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,'Main Branch','MAIN','Head Office',NULL,'EID202','Active','2026-08-24 07:53:21','2026-08-24 07:53:22');
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `eid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'EID1','','Tanmoy Biswas','tanmoybiswas478@gmail.com','Admin',NULL,'$2y$12$pwlhCwo0tDgMhHVqa3x6eexGp3CjQhE4fxA4TgyEAX6az3k6dnRt.',NULL,'2026-07-31 23:46:58','2026-07-31 23:46:58'),(3,'EID2',NULL,'Sani Shil','ss@gmail.com','Admin',NULL,'$2y$12$ZASX0FD1ufBodiusNzPyZOq4MTbFgloIU0XjM1zGivqn6M/i1NcRC',NULL,'2026-08-01 00:00:01','2026-08-01 00:00:01'),(8,NULL,'CID1','Sani Shil','sanishil.cse.tcea.2026@gmail.com','Customer',NULL,'$2y$12$AvxMmIKVIkUOa3pd6iTVcuv8aHrBGRQn5jbdtMm9RGUZ1Pw.CR.HK',NULL,'2026-08-01 06:23:30','2026-08-12 01:24:35'),(9,NULL,'CID2','Tanmoy Biswas','tanmoy.biswas@ilogitron.com','Customer',NULL,'$2y$12$zA.efgK4bvNomWVI3JiW2eLlnci3tSWw5PXPq/LWBrB206VxHSy1S',NULL,'2026-08-03 00:04:57','2026-08-24 04:55:07'),(10,'EID3',NULL,'Nabakallo Deb','nb@gmail.com','Chef',NULL,'$2y$12$mwblZ96h1u8IBMnfYQb/weRXN6B8dw5DAtQhj1sPTrsNxBQRuR/I6',NULL,'2026-08-03 01:10:56','2026-08-03 01:10:56'),(11,'EID4',NULL,'Tanmoy Biswas','tb1@gmail.com','Chef',NULL,'$2y$12$kRDDDI7kTAzxFnj/./1P3us2NdaUsiouVGEFHDX1yxqVZgk2dK8wm',NULL,'2026-08-03 04:43:46','2026-08-03 04:43:46'),(12,'EID5',NULL,'Ab','ab@gmail.com','Store Manager',NULL,'$2y$12$nNCxIUWghSWp1I2GwEfgWuXITbg4bfn5oVQ/mxF8m2d/Uie/68aye',NULL,'2026-08-18 03:31:28','2026-08-18 03:31:28'),(13,'EID201',NULL,'Ravi Kumar','delivery@foodie.test','Delivery Executive',NULL,'$2y$12$wD.Du4DLakol38NMReNv0eNsxTdCcGugJA7KBAV7ScSr5SoNtLGGq',NULL,'2026-08-24 07:53:21','2026-08-24 07:53:21'),(14,'EID202',NULL,'Sunita Rao','manager@foodie.test','Store Manager',NULL,'$2y$12$HvkjXCUuLgZwHYslzA8C8eqPbF/kaDq14Bn2AeWypY0ZF/jrcuRI2',NULL,'2026-08-24 07:53:21','2026-08-24 07:53:21'),(15,'EID203',NULL,'Amit Das','kitchen@foodie.test','Kitchen Assistant',NULL,'$2y$12$fQoO2Z9ZCRPhFTSTgqS.bu30zSZ1CxQGCc2PTX0MnKFRjTZwXLhxS',NULL,'2026-08-24 07:53:22','2026-08-24 07:53:22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'foodie_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-24 18:55:08
