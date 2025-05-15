exports.up = function(knex) {
  return knex.schema.alterTable('listings', function(table) {
    table.decimal('price', 10, 2).notNullable().defaultTo(0).alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('listings', function(table) {
    table.decimal('price').alter();
  });
}; 