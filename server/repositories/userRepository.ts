import { User } from '../../shared/schema/User/User';
import db from './db';

export const usersTable = 'users';

export const Users = () => db<User>(usersTable);
const findUnique = async (userId: string): Promise<User | undefined> => {
  console.log('Get User with id', userId);
  return Users().where('id', userId).first();
};

const findOne = async (email: string): Promise<User | undefined> => {
  console.log('Find userApi with email', email);
  return Users()
    .where({
      email,
    })
    .first();
};

export default {
  findUnique,
  findOne,
};
