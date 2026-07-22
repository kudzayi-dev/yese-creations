import * as migration_20260721_213036_initial from './20260721_213036_initial';

export const migrations = [
  {
    up: migration_20260721_213036_initial.up,
    down: migration_20260721_213036_initial.down,
    name: '20260721_213036_initial'
  },
];
