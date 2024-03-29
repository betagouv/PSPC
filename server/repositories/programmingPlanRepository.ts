import { ProgrammingPlan } from '../../shared/schema/ProgrammingPlan/ProgrammingPlans';
import db from './db';

const programmingPlansTable = 'programming_plans';

export const ProgrammingPlans = () =>
  db<ProgrammingPlan>(programmingPlansTable);

const findUnique = async (id: string): Promise<ProgrammingPlan | undefined> => {
  console.info('Find programming plan', id);
  return ProgrammingPlans().where({ id }).first();
};

const findMany = async (): Promise<ProgrammingPlan[]> => {
  console.info('Find programming plans');
  return ProgrammingPlans();
};

const insert = async (programmingPlan: ProgrammingPlan): Promise<void> => {
  console.info('Insert programming plan', programmingPlan.id);
  await ProgrammingPlans().insert(programmingPlan);
};

export default {
  findUnique,
  findMany,
  insert,
};
