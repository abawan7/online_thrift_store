exports.up = async function(knex) {
  // First check if the table exists
  const exists = await knex.schema.hasTable('listings');
  
  if (!exists) {
    // Create the table if it doesn't exist
    return knex.schema.createTable('listings', function(table) {
      table.increments('listing_id').primary();
      table.integer('user_id').references('user_id').inTable('users').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.text('description');
      table.string('quality', 50);
      table.string('location', 255);
      table.string('category', 50);
      table.decimal('price').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  // Check which columns exist
  const hasPrice = await knex.schema.hasColumn('listings', 'price');
  const hasUpdatedAt = await knex.schema.hasColumn('listings', 'updated_at');
  const hasQuality = await knex.schema.hasColumn('listings', 'quality');
  const hasCategory = await knex.schema.hasColumn('listings', 'category');

  // Add any missing columns
  return knex.schema.alterTable('listings', function(table) {
    if (!hasPrice) {
      table.decimal('price').defaultTo(0);
    }
    if (!hasUpdatedAt) {
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    }
    if (!hasQuality) {
      table.string('quality', 50);
    }
    if (!hasCategory) {
      table.string('category', 50);
    }
  });
};

exports.down = async function(knex) {
  // This down migration is potentially destructive, so we'll just remove added columns
  return knex.schema.alterTable('listings', function(table) {
    table.dropColumn('price');
    table.dropColumn('updated_at');
    table.dropColumn('quality');
    table.dropColumn('category');
  });
}; 