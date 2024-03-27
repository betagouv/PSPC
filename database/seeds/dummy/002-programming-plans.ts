import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import userRepository from '../../../server/repositories/userRepository';

exports.seed = async function () {
  const user = await userRepository.findOne('coordinateur.national@pspc.fr');

  if (!user) {
    return;
  }

  await ProgrammingPlans().insert([
    {
      id: uuidv4(),
      title: 'Plan de surveillance',
      createdAt: new Date(),
      createdBy: user.id,
      kind: 'Surveillance',
    },
    {
      id: uuidv4(),
      title: 'Plan de contrôle',
      createdAt: new Date(),
      createdBy: user.id,
      kind: 'Control',
    },
  ]);
};
