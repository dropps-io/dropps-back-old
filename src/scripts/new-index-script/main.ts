import {indexL16, setValueOnConfig} from "./index-l16";

function main() {
  setValueOnConfig('latest_indexed_block', '60000').then(() => {
    indexL16().then();
  });
}

main();