exports.up = function(knex) {
  return knex.schema.hasColumn('users', 'access_level').then(function(exists) {
    if (!exists) {
      return knex.schema.table('users', function(table) {
        table.integer('access_level').defaultTo(1);
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('access_level');
  });
};
