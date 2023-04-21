import {Command} from 'commander';
import {
  AirbyteConfig,
  AirbyteLogger,
  AirbyteSourceBase,
  AirbyteSourceRunner,
  AirbyteSpec,
  AirbyteStreamBase,
} from 'faros-airbyte-cdk';
import VError from 'verror';

import {Companies} from './streams';

interface SourceConfig extends AirbyteConfig {
  readonly token: string;
}

/** The main entry point. */
export function mainCommand(): Command {
  const logger = new AirbyteLogger();
  const source = new TimedoctorV2Source(logger);
  return new AirbyteSourceRunner(logger, source).mainCommand();
}

/** Example source implementation. */
export class TimedoctorV2Source extends AirbyteSourceBase<SourceConfig> {
  async spec(): Promise<AirbyteSpec> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return new AirbyteSpec(require('../resources/spec.json'));
  }
  async checkConnection(config: SourceConfig): Promise<[boolean, VError]> {
    if (config.token === '1k59QyLnY_pe7UVgws9_1mZ_8QYwwQ_n_h0IAtCOzgwI') {
      return [true, undefined];
    }
    return [false, new VError('Token is not selected')];
  }
  streams(): AirbyteStreamBase[] {
    return [new Companies(this.logger)];
  }
}
