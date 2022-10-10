import {clearDB} from "../test/helpers/database-helper";
import {fillDb} from "./db-scripts/fill-db";
import {setDisplays} from "./db-scripts/set-displays";
import {insertConfig} from "./db-scripts/insert-config";

clearDB().then(() => {
  fillDb().then(() => {
    setDisplays().then(() => {
      insertConfig().then();
    })
  })
})