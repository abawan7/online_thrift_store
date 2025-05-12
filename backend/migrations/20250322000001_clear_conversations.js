exports.up = function(knex) {
  return knex('messages').del()
    .then(() => {
      return knex('conversations').del();
    });
};

exports.down = function(knex) {
  // No down migration needed as we're just clearing data
  return Promise.resolve();
}; 