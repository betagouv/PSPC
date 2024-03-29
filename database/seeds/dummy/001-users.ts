import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../../../server/repositories/userRepository';

exports.seed = async function () {
  await Users().insert([
    {
      id: uuidv4(),
      email: 'admin@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
      role: 'Administrator',
    },
    {
      id: uuidv4(),
      email: 'coordinateur.national@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
      role: 'NationalCoordinator',
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
      role: 'RegionalCoordinator',
      region: 'GES',
    },
    {
      id: uuidv4(),
      email: 'preleveur@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
      role: 'Sampler',
      region: 'GES',
    },
  ]);
};
