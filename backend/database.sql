CREATE DATABASE IF NOT EXISTS `smarthome_supermarket`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `smarthome_supermarket`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'staff',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` INT UNSIGNED NOT NULL DEFAULT 0,
  `capacity` INT UNSIGNED NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_sku_unique` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @drop_stock_capacity_check = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE `products` DROP CONSTRAINT `products_stock_capacity_check`',
    'SELECT 1'
  )
  FROM information_schema.check_constraints
  WHERE constraint_schema = DATABASE()
    AND constraint_name = 'products_stock_capacity_check'
);
PREPARE drop_stock_capacity_check FROM @drop_stock_capacity_check;
EXECUTE drop_stock_capacity_check;
DEALLOCATE PREPARE drop_stock_capacity_check;

CREATE TABLE IF NOT EXISTS `sales` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket` VARCHAR(60) NOT NULL,
  `buyer` VARCHAR(255) NOT NULL,
  `server_name` VARCHAR(100) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `sold_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sales_ticket_unique` (`ticket`),
  KEY `sales_sold_at_index` (`sold_at`),
  CONSTRAINT `sales_user_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_id` BIGINT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_items_sale_index` (`sale_id`),
  KEY `sale_items_product_index` (`product_id`),
  CONSTRAINT `sale_items_sale_foreign`
    FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sale_items_product_foreign`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`name`, `email`, `password_hash`, `role`)
VALUES (
  'Store Manager',
  'admin@smarthome.com',
  '$2a$10$jgKjC.qtzT4Yo7qdb56em.LU98bEf0YmY9DRtg.xRtRG9qyNeOETa',
  'admin'
)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password_hash` = VALUES(`password_hash`),
  `role` = VALUES(`role`);

INSERT INTO `products` (`name`, `sku`, `category`, `price`, `stock`, `capacity`)
VALUES
  ('Fresh Milk 1L', 'GV-MILK-001', 'Beverages', 180.00, 18, 60),
  ('Pishori Rice 5kg', 'GV-RICE-502', 'Food', 1680.00, 42, 70),
  ('Brown Bread', 'GV-BREAD-104', 'Food', 95.00, 9, 45),
  ('Tomato Sauce 500g', 'GV-SAUCE-221', 'Food', 260.00, 27, 50),
  ('Cooking Oil 2L', 'GV-OIL-830', 'Household', 620.00, 61, 80),
  ('Banana Pack', 'GV-BANANA-077', 'Food', 150.00, 14, 55),
  ('Sugar 2kg', 'GV-SUGAR-210', 'Food', 340.00, 72, 90),
  ('Bath Soap', 'GV-SOAP-012', 'Personal Care', 85.00, 24, 80),
  ('Electric Kettle', 'GV-KET-910', 'Electronics', 3500.00, 12, 32),
  ('Notebook Pack', 'GV-NOTE-210', 'Stationary', 180.00, 20, 40),
  ('Cotton T-Shirt', 'GV-TSHIRT-311', 'Clothing', 640.00, 16, 30)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `category` = VALUES(`category`),
  `price` = VALUES(`price`),
  `stock` = VALUES(`stock`),
  `capacity` = VALUES(`capacity`);
