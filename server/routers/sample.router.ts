import express from 'express';
import {
  PartialSample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import sampleController from '../controllers/sampleController';
import { permissionsCheck } from '../middlewares/auth';
import validator, { body, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get('', permissionsCheck(['readSamples']), sampleController.findSamples);
router.get(
  '/:sampleId',
  validator.validate(uuidParam('sampleId')),
  permissionsCheck(['readSamples']),
  sampleController.getSample
);
router.post(
  '',
  validator.validate(body(SampleToCreate)),
  permissionsCheck(['createSample']),
  sampleController.createSample
);
router.put(
  '/:sampleId',
  validator.validate(uuidParam('sampleId').merge(body(PartialSample))),
  permissionsCheck(['updateSample']),
  sampleController.updateSample
);

export default router;
