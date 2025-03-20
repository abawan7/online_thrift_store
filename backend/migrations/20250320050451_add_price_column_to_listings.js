exports.up = async function(knex) {
    await knex.schema.table('listings', function(table) {
      table.decimal('price').defaultTo(0);  // Add price column with default value of 0
    });
  };
  
  exports.down = async function(knex) {
    await knex.schema.table('listings', function(table) {
      table.dropColumn('price');  // Drop the price column
    });
  };
  