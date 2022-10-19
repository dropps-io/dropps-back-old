import {fillDb} from "./db-scripts/fill-db";
import {setDisplays} from "./db-scripts/set-displays";
import {insertConfig} from "./db-scripts/insert-config";

fillDb().then(() => {
  setDisplays().then(() => {
    insertConfig().then();
  })
});
