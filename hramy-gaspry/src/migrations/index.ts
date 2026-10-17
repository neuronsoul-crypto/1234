import * as migration_20261017_161021_initial from './20261017_161021_initial';

export const migrations = [
  {
    up: migration_20261017_161021_initial.up,
    down: migration_20261017_161021_initial.down,
    name: '20261017_161021_initial'
  },
];
