import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { parse, startOfDay } from 'date-fns';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { MatrixList, MatrixPartList } from 'shared/foodex2/Matrix';
import { SampleStageList } from 'shared/schema/Sample/SampleStage';
import { SampleStorageConditionList } from 'shared/schema/Sample/SampleStorageCondition';
import { genCreatedSample } from 'shared/test/testFixtures';
import { store } from 'src/store/store';
import config from 'src/utils/config';
import SampleStep2 from 'src/views/SampleView/SampleStep2';
import {
  getRequestCalls,
  mockRequests,
} from '../../../../test/requestUtils.test';

describe('SampleFormStep2', () => {
  const user = userEvent.setup();

  test('should render form successfully', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={genCreatedSample()} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getAllByTestId('matrixpart-select')).toHaveLength(2);
    expect(screen.getAllByTestId('culturekind-select')).toHaveLength(2);
    expect(screen.getAllByTestId('stage-select')).toHaveLength(2);
    expect(screen.getByLabelText('Contrôle libératoire')).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        'Condition de maintien du prélèvement sous température dirigée'
      )
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('expirydate-input')).toHaveLength(2);
    expect(screen.getAllByTestId('storagecondition-select')).toHaveLength(2);
    expect(screen.getAllByTestId('locationSiret-input')).toHaveLength(2);
    expect(screen.getAllByTestId('location-name-input')).toHaveLength(2);
    expect(screen.getAllByTestId('comment-input')).toHaveLength(2);

    expect(screen.getByTestId('previous-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should handle errors on submitting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={genCreatedSample()} />
        </BrowserRouter>
      </Provider>
    );

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText('Veuillez renseigner la catégorie de matrice.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner la matrice.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner la partie du végétal.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le stade de prélèvement.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le SIRET du lieu de prélèvement.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le nom du lieu de prélèvement.')
    ).toBeInTheDocument();
  });

  test('should save on blur without handling errors', async () => {
    const createdSample = genCreatedSample();
    mockRequests([
      {
        pathname: `/api/samples/${createdSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
    ]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={genCreatedSample()} />
        </BrowserRouter>
      </Provider>
    );
    const matrixKindSelect = screen.getAllByTestId('matrixkind-select')[1];
    const matrixSelect = screen.getAllByTestId('matrix-select')[1];

    await act(async () => {
      await user.selectOptions(matrixKindSelect, 'Fruits');
      await user.click(matrixSelect);
    });
    expect(
      screen.queryByText('Veuillez renseigner la catégorie de matrice.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner la matrice.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner la partie du végétal.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le stade de prélèvement.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le SIRET du lieu de prélèvement.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le nom du lieu de prélèvement.')
    ).not.toBeInTheDocument();

    const calls = await getRequestCalls(fetchMock);
    expect(calls).toHaveLength(1);
  });

  test('should submit the sample with updating it status', async () => {
    const createdSample = genCreatedSample();

    mockRequests([
      {
        pathname: `/api/samples/${createdSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
    ]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={createdSample} />
        </BrowserRouter>
      </Provider>
    );

    const matrixKindSelect = screen.getAllByTestId('matrixkind-select')[1];
    const matrixSelect = screen.getAllByTestId('matrix-select')[1];
    const matrixPartSelect = screen.getAllByTestId('matrixpart-select')[1];
    const cultureKindSelect = screen.getAllByTestId('culturekind-select')[1];
    const stageSelect = screen.getAllByTestId('stage-select')[1];
    const expiryDateInput = screen.getAllByTestId('expirydate-input')[1];
    const storageConditionSelect = screen.getAllByTestId(
      'storagecondition-select'
    )[1];
    const locationSiretInput = screen.getAllByTestId('locationSiret-input')[1];
    const locationNameInput = screen.getAllByTestId('location-name-input')[1];
    const commentInput = screen.getAllByTestId('comment-input')[1];
    const submitButton = screen.getByTestId('submit-button');

    await act(async () => {
      await user.selectOptions(matrixKindSelect, 'Fruits');
      await user.selectOptions(matrixSelect, MatrixList[0]);
      await user.selectOptions(matrixPartSelect, MatrixPartList[0]);
      await user.selectOptions(cultureKindSelect, 'Bio');
      await user.selectOptions(stageSelect, SampleStageList[0]);
      await user.type(expiryDateInput, '2023-12-31');
      await user.selectOptions(
        storageConditionSelect,
        SampleStorageConditionList[0]
      );
      await user.type(locationSiretInput, '12345678901234');
      await user.type(locationNameInput, 'Test');
      await user.type(commentInput, 'Test');
      await user.click(submitButton);
    });

    const calls = await getRequestCalls(fetchMock);
    expect(calls).toHaveLength(11);

    expect(calls).toContainEqual({
      url: `${config.apiEndpoint}/api/samples/${createdSample.id}`,
      method: 'PUT',
      body: {
        ...createdSample,
        createdAt: createdSample.createdAt.toISOString(),
        sampledAt: createdSample.sampledAt.toISOString(),
        status: 'DraftItems',
        matrixKind: 'Fruits',
        matrix: MatrixList[0],
        matrixPart: MatrixPartList[0],
        cultureKind: 'Bio',
        stage: SampleStageList[0],
        expiryDate: startOfDay(
          parse('2023-12-31', 'yyyy-MM-dd', new Date())
        ).toISOString(),
        storageCondition: SampleStorageConditionList[0],
        locationSiret: '12345678901234',
        locationName: 'Test',
        comment: 'Test',
      },
    });
  });
});
