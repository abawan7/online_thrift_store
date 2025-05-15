exports.up = function(knex) {
  return knex.schema.table('listings', function(table) {
    table.decimal('price', 10, 2).notNullable().defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.table('listings', function(table) {
    table.dropColumn('price');
  });
}; 