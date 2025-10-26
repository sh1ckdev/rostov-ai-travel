CREATE DATABASE  IF NOT EXISTS `db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `db`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.14-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `user_id` int(11) NOT NULL,
  `item_type` enum('hotel','restaurant','ivent') NOT NULL,
  `item_id` int(11) NOT NULL,
  `added_date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`,`item_type`,`item_id`),
  KEY `fk_favorites_user_idx` (`user_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `ext` varchar(45) NOT NULL,
  `data` longblob DEFAULT NULL,
  `filescol` varchar(45) DEFAULT NULL,
  `filescol1` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES (1,'jpg',NULL,NULL,NULL),(2,'webp',NULL,NULL,NULL),(3,'webp',NULL,NULL,NULL),(4,'webp',NULL,NULL,NULL),(5,'webp',NULL,NULL,NULL),(6,'webp',NULL,NULL,NULL),(7,'webp',NULL,NULL,NULL),(8,'jpg',NULL,NULL,NULL),(9,'webp',NULL,NULL,NULL),(10,'webp',NULL,NULL,NULL),(11,'webp',NULL,NULL,NULL),(12,'jpg',NULL,NULL,NULL),(13,'jpg',NULL,NULL,NULL),(14,'jpg',NULL,NULL,NULL),(15,'jpg',NULL,NULL,NULL),(16,'webp',NULL,NULL,NULL),(17,'jpg',NULL,NULL,NULL),(18,'png',NULL,NULL,NULL),(19,'webp',NULL,NULL,NULL),(20,'webp',NULL,NULL,NULL),(21,'webp',NULL,NULL,NULL),(22,'webp',NULL,NULL,NULL),(23,'jpg',NULL,NULL,NULL),(24,'jpg',NULL,NULL,NULL),(25,'webp',NULL,NULL,NULL),(26,'webp',NULL,NULL,NULL),(27,'jpg',NULL,NULL,NULL),(28,'webp',NULL,NULL,NULL),(29,'jpg',NULL,NULL,NULL),(30,'jpg',NULL,NULL,NULL),(31,'webp',NULL,NULL,NULL),(32,'webp',NULL,NULL,NULL),(33,'webp',NULL,NULL,NULL),(34,'webp',NULL,NULL,NULL),(35,'webp',NULL,NULL,NULL),(36,'webp',NULL,NULL,NULL),(37,'webp',NULL,NULL,NULL),(38,'jpg',NULL,NULL,NULL),(39,'webp',NULL,NULL,NULL),(40,'webp',NULL,NULL,NULL),(41,'jpg',NULL,NULL,NULL),(42,'jpg',NULL,NULL,NULL),(43,'webp',NULL,NULL,NULL),(44,'webp',NULL,NULL,NULL),(45,'webp',NULL,NULL,NULL),(46,'jpg',NULL,NULL,NULL),(47,'webp',NULL,NULL,NULL),(48,'webp',NULL,NULL,NULL),(49,'webp',NULL,NULL,NULL),(50,'jpg',NULL,NULL,NULL),(51,'webp',NULL,NULL,NULL),(52,'webp',NULL,NULL,NULL),(53,'jpg',NULL,NULL,NULL),(54,'jpg',NULL,NULL,NULL),(55,'webp',NULL,NULL,NULL),(56,'webp',NULL,NULL,NULL),(57,'webp',NULL,NULL,NULL),(58,'jpg',NULL,NULL,NULL);
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files_has_hotel`
--

DROP TABLE IF EXISTS `files_has_hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files_has_hotel` (
  `files_id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  PRIMARY KEY (`files_id`,`hotel_id`),
  KEY `fk_files_has_hotel_hotel1_idx` (`hotel_id`),
  KEY `fk_files_has_hotel_files1_idx` (`files_id`),
  CONSTRAINT `fk_files_has_hotel_files1` FOREIGN KEY (`files_id`) REFERENCES `files` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_files_has_hotel_hotel1` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files_has_hotel`
--

LOCK TABLES `files_has_hotel` WRITE;
/*!40000 ALTER TABLE `files_has_hotel` DISABLE KEYS */;
/*!40000 ALTER TABLE `files_has_hotel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files_has_ivents`
--

DROP TABLE IF EXISTS `files_has_ivents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files_has_ivents` (
  `files_id` int(11) NOT NULL,
  `ivents_id` int(11) NOT NULL,
  PRIMARY KEY (`files_id`,`ivents_id`),
  KEY `fk_files_has_ivents_ivents1_idx` (`ivents_id`),
  KEY `fk_files_has_ivents_files1_idx` (`files_id`),
  CONSTRAINT `fk_files_has_ivents_files1` FOREIGN KEY (`files_id`) REFERENCES `files` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_files_has_ivents_ivents1` FOREIGN KEY (`ivents_id`) REFERENCES `ivent` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files_has_ivents`
--

LOCK TABLES `files_has_ivents` WRITE;
/*!40000 ALTER TABLE `files_has_ivents` DISABLE KEYS */;
/*!40000 ALTER TABLE `files_has_ivents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel`
--

DROP TABLE IF EXISTS `hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel` (
  `id` int(11) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `daytime_open` time DEFAULT NULL,
  `daytime_close` time DEFAULT NULL,
  `cost` varchar(45) DEFAULT NULL,
  `adress` varchar(45) DEFAULT NULL,
  `contacts` varchar(45) DEFAULT NULL,
  `is_avalible` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel`
--

LOCK TABLES `hotel` WRITE;
/*!40000 ALTER TABLE `hotel` DISABLE KEYS */;
INSERT INTO `hotel` VALUES (1,'Radisson Gorizont Rostov-on-Don','Отель сети Radisson с современными номерами. Расположен в деловом районе города с хорошей транспортной доступностью.','14:00:00','12:00:00','7865','проспект Нагибина, д.32Д/2','+7(863)244-00-00',1),(2,'Marins Park Hotel Ростов','Крупный отель в самом центре города. Предлагает разнообразные варианты размещения и конференц-залы.','14:00:00','12:00:00','3868','Буденновский проспект, д.59','+7(863)238-40-00',1),(4,'Отель Парадис','Небольшой комфортабельный отель в центральной части города. Подходит для деловых поездок и туризма.','14:00:00','12:00:00','3389','ул. Баумана, д. 22','+7(863)267-89-00',1),(5,'Конгресс Отель Дон Плаза','Отель с историей в центре Ростова. Имеет конгресс-холл для проведения мероприятий и банкетов.','14:00:00','12:00:00','4400','улица Большая Садовая, д.115','+7(863)244-33-33',1),(6,'Бутик-отель «39» by SATEEN GROUP','Дизайнерский бутик-отель в тихом районе центра. Отличается индивидуальным подходом к каждому гостю.','14:00:00','12:00:00','8288','ул. Шаумяна д. 39','+7(863)233-39-39',1),(7,'Отель Arka','Современный отель на главной улице города. Предлагает номера с современным дизайном и оборудованием.','14:00:00','12:00:00','7920','Большая Садовая улица, 114А','+7(863)210-10-10',1),(8,'Отель Гранд Ростов Хаятт Ридженси','Премиальный отель международной сети Hyatt. Расположен в отреставрированном историческом здании.','15:00:00','12:00:00','11050','улица Большая Садовая, д. 121','+7(863)210-12-34',1),(9,'Отель Кортъярд Ростов-на-Дону','Отель сети Marriott на левом берегу Дона. Имеет вид на реку и современный фитнес-центр.','14:00:00','12:00:00','6300','улица Левобережная, д.2К','+7(863)210-20-20',1),(10,'Отель Аэро','Отель рядом с аэропортом Платов. Удобен для транзитных пассажиров и ранних вылетов.','12:00:00','10:00:00','2794','проспект Шолохова, зд. 270/1','+7(863)238-50-50',1),(11,'Отель Ramada by Wyndham','Отель международной сети с спа-центром. Расположен в пешей доступности от центра города.','14:00:00','12:00:00','6300','улица Малюгиной, дом 119','+7(863)210-30-30',1),(12,'Гостинично-ресторанный комплекс Атташе','Отель с собственным рестораном и банкетными залами. Популярен для проведения свадеб и мероприятий.','14:00:00','12:00:00','5882','проспект Соколова, д.19/22','+7(863)210-40-40',1),(13,'Отель Mercure Ростов-на-Дону Центр','Отель сети Accor в деловом центре города. Предлагает стандарты международного уровня обслуживания.','14:00:00','12:00:00','6938','Ворошиловский проспект, д. 35/107','+7(863)210-50-50',1),(14,'Отель Шервуд','Отель в центральном районе города. Сочетает доступные цены и комфортные условия размещения.','14:00:00','12:00:00','3240','Социалистическая улица, д.51','+7(863)210-60-60',1),(15,'Отель Сити Отель','Бюджетный отель в центре города. Подходит для экономных путешественников и кратковременного проживания.','14:00:00','12:00:00','2500','Социалистическая 80/29, помещ. 1','+7(863)210-70-70',1),(16,'Марелла','Экономный вариант размещения в спальном районе. Имеет хорошую транспортную доступность до центра.','14:00:00','12:00:00','1972','улица Липецкая, д.4','+7(863)210-80-80',1),(17,'Топос Конгресс-Отель','Бывший ВертолОтель, переименованный после реконструкции. Специализируется на деловых мероприятиях.','14:00:00','12:00:00','4109','Михаила Нагибина проспект, 30','+7(863)238-60-60',1),(18,'Бутик-Отель Прованс','Отель в французском стиле в центре города. Предлагает уютную атмосферу и индивидуальное обслуживание.','14:00:00','12:00:00','2686','улица Шаумяна, д.104','+7(863)210-90-90',1),(19,'Отель AREDO','Современный отель в пешей доступности от центра. Отличается вниманием к деталям и качеством сервиса.','14:00:00','12:00:00','4500','улица Текучева, д.198А','+7(863)211-00-00',1),(20,'Отель Березовый Двор','Отель в тихом переулке в центре города. Создает атмосферу уединения и спокойного отдыха.','14:00:00','12:00:00','5575','переулок Газетный, д.76','+7(863)211-11-11',1);
/*!40000 ALTER TABLE `hotel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_has_reviews`
--

DROP TABLE IF EXISTS `hotel_has_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_has_reviews` (
  `hotel_id` int(11) NOT NULL,
  `reviews_id` timestamp NOT NULL,
  PRIMARY KEY (`hotel_id`,`reviews_id`),
  KEY `fk_hotel_has_reviews_reviews1_idx` (`reviews_id`),
  KEY `fk_hotel_has_reviews_hotel1_idx` (`hotel_id`),
  CONSTRAINT `fk_hotel_has_reviews_hotel1` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_hotel_has_reviews_reviews1` FOREIGN KEY (`reviews_id`) REFERENCES `reviews` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_has_reviews`
--

LOCK TABLES `hotel_has_reviews` WRITE;
/*!40000 ALTER TABLE `hotel_has_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel_has_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ivent`
--

DROP TABLE IF EXISTS `ivent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ivent` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `datetime_open` time DEFAULT NULL,
  `datetime_close` time DEFAULT NULL,
  `cost` varchar(45) DEFAULT NULL,
  `adress` varchar(45) DEFAULT NULL,
  `contacts` varchar(45) DEFAULT NULL,
  `is_avalible` tinyint(4) NOT NULL DEFAULT 1,
  `age_limit` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ivent`
--

LOCK TABLES `ivent` WRITE;
/*!40000 ALTER TABLE `ivent` DISABLE KEYS */;
INSERT INTO `ivent` VALUES (1,'Большой оркестр — большая история','Концерт симфонического оркестра в филармонии','18:00:00','20:30:00','от 1000 ₽','Филармония, Ростов-на-Дону','+7(863)240-01-01',0,6),(3,'Волки и овцы','Спектакль по классической пьесе в театре драмы','18:30:00','21:00:00','от 800 ₽','Театр драмы им. Горького, Ростов-на-Дону','+7(863)240-01-03',1,16),(4,'Летучая мышь','Оперетта в музыкальном театре','18:00:00','20:30:00','от 1000 ₽','Музыкальный театр, Ростов-на-Дону','+7(863)240-01-04',1,12),(5,'Дома с собачкой','Спектакль в молодежном театре','19:00:00','21:00:00','от 1000 ₽','Молодёжный театр, Ростов-на-Дону','+7(863)240-01-05',1,16),(6,'Доктор Айболит','Детский спектакль в театре кукол','11:00:00','12:30:00','от 500 ₽','Театр кукол им. Билкова, Ростов-на-Дону','+7(863)240-01-06',1,0),(7,'На автомобиле по Ростову-на-Дону','Индивидуальная обзорная экскурсия по городу','10:00:00','13:00:00','от 10700 ₽','Ростов-на-Дону','+7(863)240-01-07',1,0),(8,'Прогулка по Ростову-на-Дону','Обзорная пешая экскурсия по историческому центру','11:00:00','13:30:00','от 8660 ₽','Центр города, Ростов-на-Дону','+7(863)240-01-08',1,0),(9,'Станицa Старочеркасская за 1 час','Экскурсия в станицу Старочеркасскую','12:00:00','17:00:00','от 4390 ₽','Станица Старочеркасская','+7(863)240-01-09',1,0),(10,'Знакомство с Ростовом-на-Дону','Обзорная экскурсия по основным достопримечательностям','10:30:00','13:00:00','от 1600 ₽','Ростов-на-Дону','+7(863)240-01-10',1,0),(11,'О традициях казаков и чаепитие в станице','Лекция о традициях донских казаков с чаепитием','15:00:00','17:00:00','от 2000 ₽','Станица Старочеркасская','+7(863)240-01-11',1,12),(12,'Шерлок Холмс','Квест средней сложности по мотивам детективных историй','12:00:00','22:00:00','от 4000 ₽','Квест-рум, Ростов-на-Дону','+7(863)240-01-12',1,14),(13,'Доска дьявола','Хоррор квест легкой сложности','12:00:00','22:00:00','от 5300 ₽','Квест-рум, Ростов-на-Дону','+7(863)240-01-13',1,18),(14,'Психбольница','Хоррор квест средней сложности','12:00:00','22:00:00','от 4000 ₽','Квест-рум, Ростов-на-Дону','+7(863)240-01-14',1,18),(15,'Гарри и последний крестраж','Квест легкой сложности по мотивам фэнтези','12:00:00','22:00:00','от 5500 ₽','Квест-рум, Ростов-на-Дону','+7(863)240-01-15',1,12),(16,'Дама с собачкой','Спектакль по рассказу Чехова в молодежном театре','19:00:00','21:00:00','от 1000 ₽','Молодёжный театр, Ростов-на-Дону','+7(863)240-01-16',1,16),(17,'Тайны и призраки Ростова','Вечерняя пешеходная экскурсия по мистическим местам города','20:00:00','22:00:00','от 1720 ₽','Центр города, Ростов-на-Дону','+7(863)240-01-17',1,16),(18,'«Ростов-папа» — громкие преступления прошлого','Экскурсионная программа по криминальной истории города','16:00:00','18:00:00','от 10220 ₽','Ростов-на-Дону','+7(863)240-01-18',1,18),(19,'Муниципальный джаз-оркестр Кима Назаретова','Концерт джазового оркестра имени известного музыканта','19:30:00','21:30:00','от 1500 ₽','Концертный зал, Ростов-на-Дону','+7(863)240-01-19',1,12),(20,'Алиса в Стране чудес','Кинопоказ фильма в сети кинотеатров города','10:00:00','23:00:00','от 500 ₽','9 кинотеатров, Ростов-на-Дону','+7(863)240-01-20',1,6);
/*!40000 ALTER TABLE `ivent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ivent_has_reviews`
--

DROP TABLE IF EXISTS `ivent_has_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ivent_has_reviews` (
  `ivent_id` int(11) NOT NULL,
  `reviews_id` timestamp NOT NULL,
  PRIMARY KEY (`ivent_id`,`reviews_id`),
  KEY `fk_ivent_has_reviews_reviews1_idx` (`reviews_id`),
  KEY `fk_ivent_has_reviews_ivent1_idx` (`ivent_id`),
  CONSTRAINT `fk_ivent_has_reviews_ivent1` FOREIGN KEY (`ivent_id`) REFERENCES `ivent` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_ivent_has_reviews_reviews1` FOREIGN KEY (`reviews_id`) REFERENCES `reviews` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ivent_has_reviews`
--

LOCK TABLES `ivent_has_reviews` WRITE;
/*!40000 ALTER TABLE `ivent_has_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `ivent_has_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant` (
  `id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `datetime_open` time DEFAULT NULL,
  `datetime_close` time DEFAULT NULL,
  `cost` varchar(45) DEFAULT NULL,
  `adress` varchar(100) DEFAULT NULL,
  `contacts` varchar(45) DEFAULT NULL,
  `is_avalible` tinyint(4) NOT NULL DEFAULT 1,
  `kitchen_type` varchar(45) NOT NULL DEFAULT 'Русская',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant`
--

LOCK TABLES `restaurant` WRITE;
/*!40000 ALTER TABLE `restaurant` DISABLE KEYS */;
INSERT INTO `restaurant` VALUES (1,'ОнегинДача','Ресторан с террасой и летней верандой. Предлагает доставку еды и кофе с собой.','10:00:00','01:00:00','2500-3500','просп. Чехова, 455, Ростов-на-Дону','+7(863)200-01-01',1,'Русская'),(2,'Эрти','Современный ресторан с авторской кухней. Доступна доставка и кофе навынос.','11:00:00','02:00:00','1500-3000','Нижнебульварная ул., 6, Ростов-на-Дону','+7(863)200-02-02',1,'Авторская'),(3,'Шнайдер Вайс Браухаус','Немецкий пивной ресторан с собственной пивоварней. Есть доставка и кофе с собой.','12:00:00','00:00:00','1500-2000','Береговая ул., 27, Ростов-на-Дону','+7(863)200-03-03',1,'Немецкая'),(4,'Корова','Ресторан мясной кухни с акцентом на говядину. Предлагает доставку и кофе навынос.','11:00:00','02:00:00','2000-2000','Красноармейская ул., 170, стр. 4, Ростов-на-Дону','+7(863)200-04-04',1,'Мясная'),(5,'Магадан','Ресторан морской кухни с акцентом на морепродукты. Работает до поздней ночи.','12:00:00','04:00:00','1500-4000','Кировский просп., 39, Ростов-на-Дону','+7(863)200-05-05',1,'Морская'),(6,'Раки и Гады','Специализированный ресторан морепродуктов. Особенность - блюда из раков и деликатесов.','12:00:00','01:00:00','4000-6000','ул. Шаумяна, 57, Ростов-на-Дону','+7(863)200-06-06',1,'Морепродукты'),(7,'Гаврош','Уютный ресторан французской кухни в центре города. Доступна доставка блюд.','10:00:00','00:00:00','1200-1500','пер. Островского, 69/36, Ростов-на-Дону','+7(863)200-07-07',1,'Французская'),(8,'Tom Yum Originals','Ресторан азиатской кухни с акцентом на тайские супы. Предлагает доставку.','11:00:00','00:00:00','1400-2000','Пушкинская ул., 163-169, Ростов-на-Дону','+7(863)200-08-08',1,'Тайская'),(9,'Общество Сытыхъ','Ресторан традиционной русской кухни. Специализируется на блюдах навынос.','10:00:00','00:00:00','1000-2000','Пушкинская ул., 118/31, Ростов-на-Дону','+7(863)200-09-09',1,'Русская'),(10,'Яхта Калипсо','Ресторан на яхте с панорамным видом на Дон. Аренда яхты с капитаном.','00:00:00','23:59:59','2000-3500','Береговая ул., 12, Ростов-на-Дону (Причал 19)','+7(863)200-10-10',1,'Европейская'),(11,'Ла фабрика','Ресторан с итальянской кухней и авторскими блюдами. Доступна доставка и кофе навынос.','11:00:00','02:00:00','1500-2500','Красноармейская ул., 168/99, Ростов-на-Дону','+7(863)200-11-11',1,'Итальянская'),(12,'Leo Wine & Kitchen','Винный ресторан с изысканной кухней. Подбор вин к блюдам от сомелье.','12:00:00','23:00:00','2500-4000','ул. Максима Горького, 195, Ростов-на-Дону','+7(863)200-12-12',1,'Европейская'),(13,'Frank by Баста','Ресторан от известного музыканта. Демократичная атмосфера и доступные цены.','10:00:00','01:00:00','500-2000','Газетный пер., 84, Ростов-на-Дону','+7(863)200-13-13',1,'Авторская'),(14,'Pinot Noir','Винный бар-ресторан с французской кухней. Большая карта вин и сыров.','12:00:00','00:00:00','1000-3500','Пушкинская ул., 25/67, Ростов-на-Дону','+7(863)200-14-14',1,'Французская'),(15,'Беллуччи','Ресторан итальянской кухни с пастой и пиццей. Доставка и кофе навынос.','11:00:00','00:00:00','1500-2000','Большая Садовая ул., 122А, Ростов-на-Дону','+7(863)200-15-15',1,'Итальянская'),(16,'Ten June','Ресторан современной европейской кухни. Работает до поздней ночи.','12:00:00','04:00:00','1900-2000','Большая Садовая ул., 114А, Ростов-на-Дону','+7(863)200-16-16',1,'Европейская'),(17,'БОЭМИ','Уютный ресторан с блюдами навынос. Подходит для быстрых обедов и ужинов.','10:00:00','00:00:00','1500-2000','Пушкинская ул., 48/41, Ростов-на-Дону','+7(863)200-17-17',1,'Европейская'),(18,'Пури Пури','Ресторан грузинской кухни с традиционными блюдами. Доставка и кофе навынос.','11:00:00','00:00:00','1000-1500','Соборный пер., 22, Ростов-на-Дону','+7(863)200-18-18',1,'Грузинская'),(19,'Платоv','Круглосуточный ресторан в центре города. Подходит для поздних ужинов и ночных встреч.','00:00:00','23:59:59','1500-2000','Большая Садовая ул., 100, Ростов-на-Дону','+7(863)200-19-19',1,'Европейская'),(20,'Сыроварня','Специализированный ресторан с сырной тематикой. Собственное производство сыров.','11:00:00','00:00:00','2500-3000','ул. Суворова, 64, Ростов-на-Дону','+7(863)200-20-20',1,'Европейская');
/*!40000 ALTER TABLE `restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_has_reviews`
--

DROP TABLE IF EXISTS `restaurant_has_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_has_reviews` (
  `restaurant_id` int(11) NOT NULL,
  `reviews_id` timestamp NOT NULL,
  PRIMARY KEY (`restaurant_id`,`reviews_id`),
  KEY `fk_restaurant_has_reviews_reviews1_idx` (`reviews_id`),
  KEY `fk_restaurant_has_reviews_restaurant1_idx` (`restaurant_id`),
  CONSTRAINT `fk_restaurant_has_reviews_restaurant1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_restaurant_has_reviews_reviews1` FOREIGN KEY (`reviews_id`) REFERENCES `reviews` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_has_reviews`
--

LOCK TABLES `restaurant_has_reviews` WRITE;
/*!40000 ALTER TABLE `restaurant_has_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurant_has_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` timestamp NULL DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) DEFAULT NULL,
  `second_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `expiration_date` datetime DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `salt` blob DEFAULT NULL,
  `location` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Admin','Admin','admin@example.com',NULL,NULL,'ZOqYOzfURcgPW96WkIU9GSV6hPbv54AMV2Eu+P6qMWs=',_binary '),���r\��&\�d�=\n\�\�\�wꍢo�6:��s�3�\�	��,KR�����)5*�ܰ�C\�=O\���\n',NULL),(2,'Tighki','Vlad','tighki@mail.ru','A0555266908B02AFEFAB9B9DC324F705F3C5C8344342F7E24C12113B663821D4','2025-11-02 05:31:05','JN9ZbHiD5ZbLLNkoNSNAh3buh1dsJ4nJ6s49jnNevYM=',_binary '��o�gE\�JlZ�۳\�\�\�{,&O��g\�\"\"�?b�7\n�@Km\�\�\���\�V�X_\"9�\�+9\�!�?�\�\�',NULL),(3,'Egor','Egor','egor@example.com','6C499286D7405A66C99DCC04901EC35CCDA50B0784A2A48EBBE82778E3DA2A58','2025-11-02 02:41:24','mcOA4ZRRu+sndYjR4flkgQHGWx9gI6ApqPgR4733Rl8=',_binary '�H�\�G\nh�����\�SWBm�y�\�\�1��\�+]�U�N�u�g~\�2\�8�*���\� �H\���s��',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_has_hotel`
--

DROP TABLE IF EXISTS `user_has_hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_has_hotel` (
  `user_id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`hotel_id`),
  KEY `fk_user_has_hotel_hotel1_idx` (`hotel_id`),
  KEY `fk_user_has_hotel_user_idx` (`user_id`),
  CONSTRAINT `fk_user_has_hotel_hotel1` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_hotel_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_has_hotel`
--

LOCK TABLES `user_has_hotel` WRITE;
/*!40000 ALTER TABLE `user_has_hotel` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_has_hotel` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-26  7:12:10
