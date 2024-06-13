import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/referential/Department';
import {
  LegalContext,
  LegalContextLabels,
  LegalContextList,
} from 'shared/referential/LegalContext';
import { Regions } from 'shared/referential/Region';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { PartialSample, SampleToCreate } from 'shared/schema/Sample/Sample';
import agenda from 'src/assets/illustrations/agenda.png';
import alarm from 'src/assets/illustrations/alarm.png';
import food from 'src/assets/illustrations/food.png';
import policeHat from 'src/assets/illustrations/police-hat.png';
import scale from 'src/assets/illustrations/scale.png';
import AppRequiredInput from 'src/components/_app/AppRequiredInput/AppRequiredInput';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import {
  useCreateSampleMutation,
  useUpdateSampleMutation,
} from 'src/services/sample.service';
import SampleGeolocation from 'src/views/SampleView/SampleGeolocation';
import { z } from 'zod';
interface Props {
  partialSample?: PartialSample;
}

const SampleStepCreation = ({ partialSample }: Props) => {
  const navigate = useNavigate();
  const { userInfos } = useAuthentication();

  const OutsideProgrammingId = 'OutsideProgramming';
  const [resytalId, setResytalId] = useState(partialSample?.resytalId);
  const [programmingPlanId, setProgrammingPlanId] = useState(
    partialSample ? partialSample.programmingPlanId ?? OutsideProgrammingId : ''
  );
  const [legalContext, setLegalContext] = useState(partialSample?.legalContext);
  const [geolocationX, setGeolocationX] = useState(
    partialSample?.geolocation.x
  );
  const [geolocationY, setGeolocationY] = useState(
    partialSample?.geolocation.y
  );
  const [isBrowserGeolocation, setIsBrowserGeolocation] = useState(false);
  const [sampledAt, setSampledAt] = useState(
    format(partialSample?.sampledAt ?? new Date(), 'yyyy-MM-dd HH:mm')
  );

  const [department, setDepartment] = useState(partialSample?.department);
  const [parcel, setParcel] = useState(partialSample?.parcel);
  const [commentCreation, setCommentCreation] = useState(
    partialSample?.commentCreation
  );

  const { data: programmingPlans } = useFindProgrammingPlansQuery({
    status: 'Validated',
  });
  const [createSample] = useCreateSampleMutation();
  const [updateSample] = useUpdateSampleMutation();

  const Form = SampleToCreate.omit({ geolocation: true }).merge(
    z.object({
      geolocationX: z.number({
        required_error: 'Veuillez renseigner la latitude.',
        invalid_type_error: 'Latitude invalide.',
      }),
      geolocationY: z.number({
        required_error: 'Veuillez renseigner la longitude.',
        invalid_type_error: 'Longitude invalide.',
      }),
    })
  );

  const form = useForm(Form, {
    geolocationX,
    geolocationY,
    sampledAt,
    resytalId,
    programmingPlanId:
      programmingPlanId === OutsideProgrammingId
        ? undefined
        : programmingPlanId,
    legalContext,
    department,
    parcel,
    commentCreation,
  });

  type FormShape = typeof Form.shape;

  const programmingPlanOptions = [
    ...(programmingPlans ?? []).map(({ id, kind }) => ({
      label: ProgrammingPlanKindLabels[kind],
      value: id,
      illustration: kind === 'Control' ? agenda : alarm,
    })),
    {
      label: 'Hors programmation',
      value: OutsideProgrammingId,
      illustration: food,
    },
  ];

  const legalContextOptions = selectOptionsFromList(LegalContextList, {
    labels: LegalContextLabels,
    withDefault: false,
  });

  const departmentOptions = selectOptionsFromList(
    userInfos?.region ? Regions[userInfos.region].departments : DepartmentList,
    {
      labels: DepartmentLabels,
    }
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      if (partialSample) {
        await save({
          status: 'DraftCompany',
        });
        navigate(`/prelevements/${partialSample.id}`, { replace: true });
      } else {
        await createSample({
          geolocation: {
            x: geolocationX as number,
            y: geolocationY as number,
          },
          sampledAt: parse(sampledAt, 'yyyy-MM-dd HH:mm', new Date()),
          resytalId: resytalId as string,
          programmingPlanId:
            (programmingPlanId as string) === OutsideProgrammingId
              ? undefined
              : (programmingPlanId as string),
          legalContext: legalContext as LegalContext,
          department: department as Department,
          parcel,
          commentCreation,
        })
          .unwrap()
          .then((result) => {
            navigate(`/prelevements/${result.id}`, { replace: true });
          });
      }
    });
  };

  const save = async (data?: Partial<PartialSample>) => {
    if (partialSample) {
      await updateSample({
        ...partialSample,
        geolocation: {
          x: geolocationX as number,
          y: geolocationY as number,
        },
        sampledAt: parse(sampledAt, 'yyyy-MM-dd', new Date()),
        resytalId: resytalId as string,
        programmingPlanId:
          (programmingPlanId as string) === OutsideProgrammingId
            ? null
            : (programmingPlanId as string),
        legalContext: legalContext as LegalContext,
        department: department as Department,
        parcel,
        commentCreation,
        ...data,
      });
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (!geolocationX && !geolocationY) {
          setGeolocationX(position.coords.latitude);
          setGeolocationY(position.coords.longitude);
        }
        setIsBrowserGeolocation(true);
      });
    } else {
      setIsBrowserGeolocation(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      data-testid="draft_sample_creation_form"
      onChange={async (e) => {
        e.preventDefault();
        await save();
      }}
      className="sample-form"
    >
      {!isBrowserGeolocation && (
        <Alert
          severity="info"
          title=""
          small
          closable
          description="Autorisez le partage de votre position pour faciliter la localisation de la parcelle"
          className={cx('fr-mb-3w')}
        />
      )}
      <p className={cx('fr-text--sm')}>
        Les champs marqués du symbole{' '}
        <span className={cx('fr-label--error')}>*</span> sont obligatoires.
      </p>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-pt-2w')}>
        <div className={cx('fr-col-12', 'fr-col-sm-8')}>
          <AppTextInput<FormShape>
            type="datetime-local"
            defaultValue={sampledAt}
            onChange={(e) => setSampledAt(e.target.value)}
            inputForm={form}
            inputKey="sampledAt"
            whenValid="Date et heure de prélèvement correctement renseignés."
            data-testid="sampledAt-input"
            label="Date et heure de prélèvement"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue={partialSample?.department || ''}
            options={departmentOptions}
            onChange={(e) => setDepartment(e.target.value as Department)}
            inputForm={form}
            inputKey="department"
            whenValid="Département correctement renseigné."
            data-testid="department-select"
            label="Département"
            required
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-pt-3w')}>
        <div className={cx('fr-col-12', 'fr-pb-0')}>
          <div className={cx('fr-text--bold')}>
            Emplacement de la parcelle contrôlée
          </div>
          <div className={cx('fr-text--light')}>
            Placez votre repère sur la zone correspondante ou renseignez
            manuellement les coordonnées GPS
          </div>
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-8')}>
          <SampleGeolocation
            sampleId={partialSample?.id}
            location={
              geolocationX && geolocationY
                ? { x: geolocationX, y: geolocationY }
                : undefined
            }
            onLocationChange={async (location) => {
              setGeolocationX(location.x);
              setGeolocationY(location.y);
              await save({
                geolocation: {
                  x: location.x,
                  y: location.y,
                },
              });
            }}
            key={`geolocation-${isBrowserGeolocation}`}
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <AppTextInput<FormShape>
                type="number"
                step={0.000001}
                value={geolocationX ?? ''}
                onChange={(e) => setGeolocationX(Number(e.target.value))}
                inputForm={form}
                inputKey="geolocationX"
                whenValid="Latitude correctement renseignée."
                data-testid="geolocationX-input"
                label="Latitude"
                required
              />
            </div>
            <div className={cx('fr-col-12')}>
              <AppTextInput<FormShape>
                type="number"
                step={0.000001}
                value={geolocationY ?? ''}
                onChange={(e) => setGeolocationY(Number(e.target.value))}
                inputForm={form}
                inputKey="geolocationY"
                whenValid="Longitude correctement renseignée."
                data-testid="geolocationY-input"
                label="Longitude"
                required
              />
            </div>
            <div className={cx('fr-col-12')}>
              <AppTextInput<FormShape>
                defaultValue={parcel ?? ''}
                onChange={(e) => setParcel(e.target.value)}
                inputForm={form}
                inputKey="parcel"
                whenValid="Parcelle correctement renseignée."
                data-testid="parcel-input"
                label="N° ou appellation de la parcelle"
                placeholder="Facultatif"
              />
            </div>
          </div>
        </div>
      </div>
      <RadioButtons
        key={`programmingPlan-${programmingPlanId}`}
        legend={
          <>
            Contexte du prélèvement
            <AppRequiredInput />
          </>
        }
        options={
          programmingPlanOptions?.map(({ label, value, illustration }) => ({
            key: `programmingPlan-option-${value}`,
            label,
            nativeInputProps: {
              checked: programmingPlanId === value,
              onChange: (e) => setProgrammingPlanId(value),
            },
            illustration: <img src={illustration} />,
          })) ?? []
        }
        state={form.messageType('programmingPlanId')}
        stateRelatedMessage={form.message('programmingPlanId')}
        classes={{
          inputGroup: cx('fr-col-12', 'fr-col-sm-6'),
          content: cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mx-0'),
          root: cx('fr-px-0', 'fr-mt-5w'),
          legend: cx('fr-col-12', 'fr-mx-0'),
        }}
      />
      <RadioButtons
        key={`legalContext-${legalContext}`}
        legend={
          <>
            Cadre juridique
            <AppRequiredInput />
          </>
        }
        options={
          legalContextOptions?.map(({ label, value }) => ({
            key: `legalContext-option-${value}`,
            label,
            nativeInputProps: {
              checked: legalContext === value,
              onChange: () => setLegalContext(value as LegalContext),
            },
            illustration: <img src={value === 'B' ? policeHat : scale} />,
          })) ?? []
        }
        state={form.messageType('legalContext')}
        stateRelatedMessage={form.message('legalContext')}
        classes={{
          inputGroup: cx('fr-col-12', 'fr-col-sm-6'),
          content: cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mx-0'),
          root: cx('fr-px-0', 'fr-mt-3w'),
          legend: cx('fr-col-12', 'fr-mx-0'),
        }}
      />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-pt-3w')}>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppTextInput<FormShape>
            type="text"
            defaultValue={partialSample?.resytalId || ''}
            onChange={(e) => setResytalId(e.target.value)}
            inputForm={form}
            inputKey="resytalId"
            whenValid="Identifiant Resytal correctement renseigné."
            data-testid="resytalId-input"
            label="Identifiant Resytal"
            hintText="Format 22XXXXXX"
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextAreaInput<FormShape>
            rows={1}
            defaultValue={commentCreation ?? ''}
            onChange={(e) => setCommentCreation(e.target.value)}
            inputForm={form}
            inputKey="commentCreation"
            whenValid="Commentaire correctement renseigné."
            data-testid="comment-input"
            label="Note additionnelle"
          />
        </div>
      </div>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <Button
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
            data-testid="submit-button"
            onClick={submit}
            style={{ float: 'right' }}
          >
            Continuer
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SampleStepCreation;
