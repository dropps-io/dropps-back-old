import {UnitTests} from "./unit/unit.test";
import {AuthTests} from "./end-to-end/auth.test";
import {LooksoTests} from "./end-to-end/lookso/lookso.test";
import {after} from "mocha";
import {DB} from "../bin/db/database";

after(() => {
  DB.end()
})

describe('Test', () => {
  UnitTests();
  AuthTests();
  LooksoTests();
});

// END TO END

