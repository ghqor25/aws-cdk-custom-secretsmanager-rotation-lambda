import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

interface HandlerEvent {
   DISTRIBUTION_ID?: string;
}

interface HandlerResponse {
   INVALIDATION_ID?: string;
   DISTRIBUTION_ID: string;
}

const cloudfrontClient = new CloudFrontClient({});

const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
   const distributionId = event['DISTRIBUTION_ID'];
   if (!distributionId) throw Error('"DISTRIBUTION_ID" is required ');

   const result = await cloudfrontClient.send(
      new CreateInvalidationCommand({
         DistributionId: distributionId,
         InvalidationBatch: { Paths: { Quantity: 1, Items: ['/*'] }, CallerReference: Date.now().toString() },
      }),
   );

   return {
      INVALIDATION_ID: result.Invalidation?.Id,
      DISTRIBUTION_ID: distributionId,
   };
};

export { handler };
