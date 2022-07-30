import {EthLog} from "./EthLog.class";
import {Log, SolEvent, UNKNOWN_SOL_EVENT} from "./EthLog.models";

export class EthLogs {

  private readonly solEventsRepo: Map<string, SolEvent>;
  private readonly provider: any;
  private readonly ethLogs: Array<EthLog>;

  constructor(solEventsRepo: Map<string, SolEvent>, provider: any) {
    this.provider = provider;
    this.ethLogs = [];
    this.solEventsRepo = solEventsRepo;
  }

  get lenght() {
    return this.ethLogs.length;
  }

  public addLog(log: Log) {
    const method = this.solEventsRepo.get(log.topics[0]) ? this.solEventsRepo.get(log.topics[0]) as SolEvent : UNKNOWN_SOL_EVENT;
    const logObject = new EthLog(log, this.provider, {method});
    this.ethLogs.push(logObject);
  }

  public async addLogAndExtract(log: Log) {
    const method = this.solEventsRepo.get(log.topics[0]) ? this.solEventsRepo.get(log.topics[0]) as SolEvent : UNKNOWN_SOL_EVENT;
    const logObject = new EthLog(log, this.provider, {method});
    this.ethLogs.push(logObject);
    await logObject.extractData();
  }

  public addLogs(logs: Log[]) {
    for (let log of logs) {
      this.addLog(log);
    }
  }

  public async addLogsAndExtract(logs: Log[]) {
    for (let log of logs) {
      await this.addLogAndExtract(log);
    }
  }

  public getLogs() {
    return this.ethLogs;
  }
}
