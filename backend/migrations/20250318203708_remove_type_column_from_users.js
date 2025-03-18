exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('type');  // Remove the 'type' column
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      table.string('type', 50).notNullable().defaultTo('user');  // Re-add the 'type' column
    });
  };
  