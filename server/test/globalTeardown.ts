import knex from 'knex';
import knexConfig from '../knex';
const knexStringcase = require('knex-stringcase');

export default async function teardown() {
  const db = knex(knexStringcase(knexConfig));
  try {
    await db.migrate.rollback(undefined, true);
    console.log('Rolled back.');
  } finally {
    await db.destroy();
  }
}
