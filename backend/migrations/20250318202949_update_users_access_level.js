exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      // Add the access_level column with default value of 1
      table.integer('access_level').defaultTo(1);
      // Drop the 'type' column
      table.dropColumn('type');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      // Re-add the 'type' column
      table.string('type', 50).notNullable().defaultTo('user');
      // Remove the 'access_level' column
      table.dropColumn('access_level');
    });
  };
  