exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
      table.string('location').nullable(); // Add the 'location' column
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
      table.dropColumn('location'); // Remove the 'location' column if rolling back
  });
};
