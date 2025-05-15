exports.up = function(knex) {
    return knex.schema
      .createTable('users', function(table) {
        table.increments('user_id').primary();
        table.string('name', 255).notNullable();
        table.string('email', 255).unique().notNullable();
        table.string('phone', 15).unique().notNullable();
        table.string('password', 255).notNullable();
        table.integer('access_level').notNullable().defaultTo(1);  // Changed 'type' to 'access_level' with default value of 1
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('wishlists', function(table) {
        table.increments('wishlist_id').primary();
        table.integer('user_id').references('user_id').inTable('users').onDelete('CASCADE');
        table.specificType('products', 'TEXT[]');
        table.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('listings', function(table) {
        table.increments('listing_id').primary();
        table.integer('user_id').references('user_id').inTable('users').onDelete('CASCADE');
        table.string('name', 255).notNullable();
        table.text('description');
        table.string('quality', 50);
        table.string('location', 255);
        table.string('category', 50);
        table.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('reviews', function(table) {
        table.increments('review_id').primary();
        table.integer('user_id').references('user_id').inTable('users').onDelete('CASCADE');
        table.integer('listing_id').references('listing_id').inTable('listings').onDelete('CASCADE');
        table.text('description');
        table.integer('rating').checkBetween([1, 5]);
        table.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('images', function(table) {
        table.increments('image_id').primary();
        table.integer('listing_id').references('listing_id').inTable('listings').onDelete('CASCADE');
        table.string('filename', 255);
        table.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('transactions', function(table) {
        table.increments('transaction_id').primary();
        table.integer('listing_id').references('listing_id').inTable('listings').onDelete('CASCADE');
        table.integer('buyer_id').references('user_id').inTable('users').onDelete('CASCADE');
        table.integer('seller_id').references('user_id').inTable('users').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('notifications', function(table) {
        table.increments('notification_id').primary();
        table.integer('listing_id').references('listing_id').inTable('listings').onDelete('CASCADE');
        table.integer('user_id').references('user_id').inTable('users').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('notifications')
      .dropTableIfExists('transactions')
      .dropTableIfExists('images')
      .dropTableIfExists('reviews')
      .dropTableIfExists('listings')
      .dropTableIfExists('wishlists')
      .dropTableIfExists('users');
  };