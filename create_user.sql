-- Создание пользователя sh1ck с паролем 123456
CREATE USER 'sh1ck'@'%' IDENTIFIED BY '123456';

-- Предоставление всех привилегий на все базы данных
GRANT ALL PRIVILEGES ON *.* TO 'sh1ck'@'%';

-- Применение изменений
FLUSH PRIVILEGES;

-- Проверка создания пользователя
SELECT User, Host FROM mysql.user WHERE User = 'sh1ck';
