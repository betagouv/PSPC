import fp from 'lodash';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import { PartialSample, SampleToCreate } from 'shared/schema/Sample/Sample';
import { api } from 'src/services/api.service';

export enum SampleMutationEndpoints {
  CREATE_SAMPLE = 'createSample',
  UPDATE_SAMPLE = 'updateSample',
  UPDATE_SAMPLE_ITEMS = 'updateSampleItems',
}

export const sampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSample: builder.query<PartialSample, string>({
      query: (sampleId) => `samples/${sampleId}`,
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (result, error, sampleId) =>
        result ? [{ type: 'Sample', id: sampleId }] : [],
    }),
    findSamples: builder.query<PartialSample[], FindSampleOptions>({
      query: (findOptions) => ({
        url: 'samples',
        params: findOptions,
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => PartialSample.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'Sample', id: 'LIST' },
        ...(result
          ? [...result.map(({ id }) => ({ type: 'Sample' as const, id }))]
          : []),
      ],
    }),
    countSamples: builder.query<number, FindSampleOptions>({
      query: (findOptions) => ({
        url: 'samples/count',
        params: findOptions,
      }),
      transformResponse: (response: { count: number }) =>
        Number(response.count),
      providesTags: ['SampleCount'],
    }),
    [SampleMutationEndpoints.CREATE_SAMPLE]: builder.mutation<
      PartialSample,
      SampleToCreate
    >({
      query: (draft) => ({
        url: 'samples',
        method: 'POST',
        body: { ...draft },
      }),
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: [{ type: 'Sample', id: 'LIST' }, 'SampleCount'],
    }),
    [SampleMutationEndpoints.UPDATE_SAMPLE]: builder.mutation<
      PartialSample,
      PartialSample
    >({
      query: (partialSample) => ({
        url: `samples/${partialSample.id}`,
        method: 'PUT',
        body: partialSample,
      }),
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', id },
        'SampleCount',
      ],
    }),
    [SampleMutationEndpoints.UPDATE_SAMPLE_ITEMS]: builder.mutation<
      void,
      { id: string; items: any[] }
    >({
      query: ({ id, items }) => ({
        url: `samples/${id}/items`,
        method: 'PUT',
        body: items,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sample', id }],
    }),
  }),
});

export const {
  useCreateSampleMutation,
  useFindSamplesQuery,
  useCountSamplesQuery,
  useGetSampleQuery,
  useUpdateSampleMutation,
  useUpdateSampleItemsMutation,
} = sampleApi;
