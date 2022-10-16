import { aws_cloudfront, aws_iam, aws_lambda, aws_lambda_nodejs, aws_stepfunctions, aws_stepfunctions_tasks, Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CloudfrontInvalidationProps {
   /**
    * The CloudFront distribution Id.
    * Files in the distribution's edge caches will be invalidated.
    */
   readonly cloudfrontDistribution: aws_cloudfront.IDistribution;
}

/**
 * stepFunction stateMachine for cloudfront invalidation.
 *
 * It might takes long because create invalidation makes timeout error in some cases,
 * like doing right after creating cloudfront distribution or validation with no interval.
 * So total timeout is set to 10 minutes, considered to be long enough.
 */
export class CloudfrontInvalidation extends Construct {
   public readonly stateMachine: aws_stepfunctions.StateMachine;
   constructor(scope: Construct, id: string, props: CloudfrontInvalidationProps) {
      super(scope, id);

      const lambdaCloudfrontCreateInvalidation = new aws_stepfunctions_tasks.LambdaInvoke(this, 'Invoke CreateInvalidation', {
         lambdaFunction: new aws_lambda_nodejs.NodejsFunction(this, 'CreateInvalidation', {
            bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            initialPolicy: [
               new aws_iam.PolicyStatement({
                  effect: aws_iam.Effect.ALLOW,
                  actions: ['cloudfront:CreateInvalidation'],
                  resources: [getCloudfrontDistributionArn(Stack.of(this).account, props.cloudfrontDistribution.distributionId)],
               }),
            ],
            retryAttempts: 0,
         }),
         payload: { type: aws_stepfunctions.InputType.OBJECT, value: { DISTRIBUTION_ID: props.cloudfrontDistribution.distributionId } },
         retryOnServiceExceptions: false,
         outputPath: '$.Payload',
      });
      lambdaCloudfrontCreateInvalidation.addRetry({ interval: Duration.seconds(90), backoffRate: 1, maxAttempts: 10 });

      const passGetInvalidation = new aws_stepfunctions.Pass(this, 'Pass GetInvalidation', {
         resultPath: aws_stepfunctions.JsonPath.DISCARD,
      });

      const wait1Mins = new aws_stepfunctions.Wait(this, 'Wait 1 Mins', {
         time: aws_stepfunctions.WaitTime.duration(Duration.minutes(1)),
      });

      const lambdaCloudfrontGetInvalidation = new aws_stepfunctions_tasks.LambdaInvoke(this, 'Invoke GetInvalidation', {
         lambdaFunction: new aws_lambda_nodejs.NodejsFunction(this, 'GetInvalidation', {
            bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            initialPolicy: [
               new aws_iam.PolicyStatement({
                  effect: aws_iam.Effect.ALLOW,
                  actions: ['cloudfront:GetInvalidation'],
                  resources: [getCloudfrontDistributionArn(Stack.of(this).account, props.cloudfrontDistribution.distributionId)],
               }),
            ],
         }),
         outputPath: '$.Payload',
      });

      const choiceResult = new aws_stepfunctions.Choice(this, 'Invalidation Complete ?')
         .when(aws_stepfunctions.Condition.stringEquals('$.STATUS', 'SUCCEEDED'), new aws_stepfunctions.Succeed(this, 'Succeeded'))
         .otherwise(passGetInvalidation);

      this.stateMachine = new aws_stepfunctions.StateMachine(this, 'StateMachine', {
         definition: lambdaCloudfrontCreateInvalidation.next(passGetInvalidation).next(wait1Mins).next(lambdaCloudfrontGetInvalidation).next(choiceResult),
         timeout: Duration.minutes(20),
      });
   }
}

const getCloudfrontDistributionArn = (account: string, distributionId: string) => `arn:aws:cloudfront::${account}:distribution/${distributionId}`;
