import {AirbyteStreamBase, StreamKey, SyncMode} from 'faros-airbyte-cdk';
import {Dictionary} from 'ts-essentials';

export class Companies extends AirbyteStreamBase {
  getJsonSchema(): Dictionary<any, string> {
    return require('../../resources/schemas/companies.json');
  }
  get primaryKey(): StreamKey {
    //return ['uid', 'source'];
    return [];
  }
  // get cursorField(): string | string[] {
  //   return 'updated_at';
  // }

  async *readRecords(
    syncMode: SyncMode,
    cursorField?: string[],
    streamSlice?: Dictionary<any, string>,
    streamState?: Dictionary<any, string>
  ): AsyncGenerator<Dictionary<any, string>, any, unknown> {
    const lastCutoff: number = streamState?.cutoff ?? 0;
    if (lastCutoff > Date.now()) {
      this.logger.info(
        `Last cutoff ${lastCutoff} is greater than current time`
      );
      return;
    }
    const numCompanies = 5;
    for (let i = 1; i <= numCompanies; i++) {
      yield this.newCompanie(i, lastCutoff);
    }
  }

  getUpdatedState(
    currentStreamState: Dictionary<any>,
    latestRecord: Dictionary<any>
  ): Dictionary<any> {
    return {
      cutoff: Math.max(
        currentStreamState.cutoff ?? 0,
        latestRecord.updated_at ?? 0
      ),
    };
  }

  private newCompanie(uid: number, cutoff: number): Dictionary<any> {
    return {
      uid: uid.toString(),
      source: 'Jenkins',
      updated_at: cutoff + uid,
      fields: {
        command: `command ${uid}`,
      },
      more_fields: [
        {
          name: `key${uid}`,
          value: `value${uid}`,
          nested: {
            value: `nested ${uid}`,
          },
        },
      ],
    };
  }
}
