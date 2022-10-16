import { aws_cloudfront, aws_cloudfront_origins, aws_codecommit, aws_s3, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CloudfrontInvalidation } from 'src/index';

interface FrontendStackProps extends StackProps {
   // referencing resource that changes within stages
   resourceBeingDifferentWithStage: string;
}

export class FrontendStack extends Stack {
   constructor(scope: Construct, id: string, props?: FrontendStackProps) {
      super(scope, id, props);

      /**
       *  s3 bucket for website
       */
      const websiteS3Bucket = new aws_s3.Bucket(this, 'WebsiteS3Bucket', {
         enforceSSL: true,
         blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
         publicReadAccess: false,
         autoDeleteObjects: true,
         removalPolicy: RemovalPolicy.DESTROY,
      });

      /**
       * this is for keep s3Bucket to block public access and only grant access to cloudfront distribution
       */
      const cloudFrontOriginAccessIdentity = new aws_cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
      websiteS3Bucket.grantRead(cloudFrontOriginAccessIdentity);

      /**
       * cloudfront distribution specs
       */
      const cloudfrontDistribution = new aws_cloudfront.Distribution(this, 'CloudfrontDistribution', {
         defaultBehavior: {
            origin: new aws_cloudfront_origins.S3Origin(websiteS3Bucket, {
               originAccessIdentity: cloudFrontOriginAccessIdentity,
            }),
            viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
            originRequestPolicy: aws_cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
         },
         minimumProtocolVersion: aws_cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
         errorResponses: [{ httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.days(7) }],
         defaultRootObject: 'index.html',
         priceClass: aws_cloudfront.PriceClass.PRICE_CLASS_200,
      });

      // // this is where to use BuildDeployStaticWebsite
      // new BuildDeployStaticWebsite(this, 'PipelineFrontend', {
      //    // recommend to use BuildDeployStaticWebsiteSource for source
      //    source: BuildDeployStaticWebsiteSource.codeCommit(
      //       aws_codecommit.Repository.fromRepositoryName(this, 'CodeCommit', 'aws-cdk-custom-build-deploy-static-website-frontend'),
      //       'main',
      //    ),
      //    // // or you can directly use SourceActions in aws_codepipeline_actions
      //    // source: new aws_codepipeline_actions.CodeCommitSourceAction({
      //    //    actionName: 'CodeCommitSourceAction',
      //    //    output: new aws_codepipeline.Artifact('sourceArtifact'),
      //    //    repository: aws_codecommit.Repository.fromRepositoryName(this, 'CodeCommit', 'aws-cdk-custom-build-deploy-static-website-frontend'),
      //    //    branch: 'main',
      //    // }),
      //    installCommands: ['yarn set version stable', 'yarn install'],
      //    buildCommands: ['yarn test', 'yarn build'],
      //    // you can reference aws cdk resources into website build environment variables.
      //    environmentVariables: {
      //       REACT_APP_TEST: { value: props?.resourceBeingDifferentWithStage },
      //    },
      //    destinationBucket: websiteS3Bucket,
      //    // If this value is set, all files in the distribution's edge caches will be invalidated after the deployment of build output.
      //    cloudfrontDistributionId: cloudfrontDistribution.distributionId,
      // });
   }
}
