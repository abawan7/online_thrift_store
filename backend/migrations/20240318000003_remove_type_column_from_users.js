exports.up = function(knex) {
  return knex.schema.hasColumn('users', 'type').then(function(exists) {
    if (exists) {
      return knex.schema.table('users', function(table) {
        table.dropColumn('type');
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('type');  // Add the column back if you roll back
  });
};
