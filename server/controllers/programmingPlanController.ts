import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import programmingPlanRepository from '../repositories/programmingPlanRepository';

const getProgrammingPlan = async (request: Request, response: Response) => {
  const { programmingPlanId } = request.params;

  console.info('Get programmingPlan', programmingPlanId);

  const programmingPlan = await programmingPlanRepository.findUnique(
    programmingPlanId
  );

  if (!programmingPlan) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  response.status(constants.HTTP_STATUS_OK).send(programmingPlan);
};

const findProgrammingPlans = async (request: Request, response: Response) => {
  const { userId } = (request as AuthenticatedRequest).auth;

  console.info('Find programmingPlans for user', userId);

  const programmingPlans = await programmingPlanRepository.findMany();

  response.status(constants.HTTP_STATUS_OK).send(programmingPlans);
};

export default {
  getProgrammingPlan,
  findProgrammingPlans,
};
