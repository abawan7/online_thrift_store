exports.up = async function(knex) {
    // Create the 'listing_tag' table
    await knex.schema.createTable('listing_tag', function(table) {
      table.increments('id').primary(); // Unique identifier for each entry
      table.integer('listing_id').unsigned().notNullable(); // Foreign key to listings table
      table.string('tag_name', 255).notNullable(); // Tag name (string, not nullable)
      table.timestamps(true, true); // Created_at and updated_at columns
  
      // Add foreign key constraint for listing_id referencing listings table
      table.foreign('listing_id').references('listing_id').inTable('listings').onDelete('CASCADE');
    });
  };
  
  exports.down = async function(knex) {
    // Drop the 'listing_tag' table if it exists
    await knex.schema.dropTableIfExists('listing_tag');
  };
  