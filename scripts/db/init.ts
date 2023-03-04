import { fillDb } from './fill-db';
import { setDisplays } from './set-displays';
import { insertConfig } from './insert-config';

fillDb().then(() => {
  setDisplays().then(() => {
    insertConfig().then();
  });
});
