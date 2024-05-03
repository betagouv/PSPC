import fp from 'lodash';
import { Regions } from '../../shared/schema/Region';
import { FindSampleOptions } from '../../shared/schema/Sample/FindSampleOptions';
import {
  CreatedSample,
  PartialSample,
} from '../../shared/schema/Sample/Sample';
import db from './db';

const samplesTable = 'samples';
const samplesSerial = 'samples_serial';

export const Samples = () => db<PartialSample>(samplesTable);

const findUnique = async (id: string): Promise<PartialSample | undefined> => {
  console.info('Find sample', id);
  return Samples()
    .where({ id })
    .first()
    .then((_) => _ && PartialSample.parse(fp.omitBy(_, fp.isNil)));
};

const findMany = async (
  findOptions: FindSampleOptions
): Promise<PartialSample[]> => {
  console.info('Find samples', fp.omitBy(findOptions, fp.isNil));
  return Samples()
    .where(fp.omitBy(fp.omit(findOptions, 'region'), fp.isNil))
    .modify((builder) => {
      if (findOptions.region) {
        builder.whereIn('department', Regions[findOptions.region].departments);
      }
    })
    .then((samples) =>
      samples.map((_: any) => PartialSample.parse(fp.omitBy(_, fp.isNil)))
    );
};

const getSerial = async (): Promise<number> => {
  const result = await db.select(db.raw(`nextval('${samplesSerial}')`)).first();
  return result.nextval;
};

const insert = async (createdSample: CreatedSample): Promise<void> => {
  console.info('Insert sample', createdSample.id);
  await Samples().insert(formatPartialSample(createdSample));
};

const update = async (partialSample: PartialSample): Promise<void> => {
  console.info('Update sample', partialSample.id);
  if (Object.keys(partialSample).length > 0) {
    await Samples()
      .where({ id: partialSample.id })
      .update(formatPartialSample(partialSample));
  }
};

export const formatPartialSample = (partialSample: PartialSample) => ({
  ...fp.omit(partialSample, ['items']),
  userLocation: db.raw('Point(?, ?)', [
    partialSample.userLocation.x,
    partialSample.userLocation.y,
  ]),
});

export default {
  insert,
  update,
  findUnique,
  findMany,
  getSerial,
};
