exports.up = function(knex) {
  return knex.schema.table('wishlists', function(table) {
    table.specificType('item_descriptions', 'text[]').defaultTo('{}');
    table.specificType('keywords', 'text[]').defaultTo('{}');
  });
};

exports.down = function(knex) {
  return knex.schema.table('wishlists', function(table) {
    table.dropColumn('item_descriptions');
    table.dropColumn('keywords');
  });
};