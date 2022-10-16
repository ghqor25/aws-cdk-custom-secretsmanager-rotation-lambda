import { CloudFrontClient, GetInvalidationCommand } from '@aws-sdk/client-cloudfront';

interface HandlerEvent {
   DISTRIBUTION_ID?: string;
   INVALIDATION_ID?: string;
}

interface HandlerResponse extends HandlerEvent {
   STATUS: 'SUCCEEDED' | 'IN_PROGRESS';
}

const cloudfrontClient = new CloudFrontClient({});

const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
   const distributionId = event['DISTRIBUTION_ID'];
   if (!distributionId) throw Error('"DISTRIBUTION_ID" is required ');
   const invalidationId = event['INVALIDATION_ID'];
   if (!invalidationId) throw Error('"INVALIDATION_ID" is required ');

   const result = await cloudfrontClient.send(new GetInvalidationCommand({ DistributionId: distributionId, Id: invalidationId }));

   // Could not get GetInvalidation response status values, but just "Completed".
   // So will treat other values as "IN_PROGRESS"
   // @see https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_GetInvalidation.html#API_GetInvalidation_ResponseSyntax
   if (result.Invalidation?.Status === 'Completed') return { STATUS: 'SUCCEEDED' };
   else return { STATUS: 'IN_PROGRESS', DISTRIBUTION_ID: distributionId, INVALIDATION_ID: invalidationId };
};

export { handler };
