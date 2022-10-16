import { aws_codebuild, aws_codecommit, Duration, pipelines, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DevStage } from 'lib/stages/dev';
import { ProdStage } from 'lib/stages/prod';

export class PipelineStack extends Stack {
   constructor(scope: Construct, id: string, props: StackProps) {
      super(scope, id, props);

      /** common pipeline props */
      const pipelineProps = {
         synthCodeBuildDefaults: {
            buildEnvironment: {
               computeType: aws_codebuild.ComputeType.SMALL,
               buildImage: aws_codebuild.LinuxBuildImage.STANDARD_6_0,
            },
            timeout: Duration.minutes(10),
         },
         codeBuildDefaults: {
            buildEnvironment: {
               computeType: aws_codebuild.ComputeType.SMALL,
               buildImage: aws_codebuild.LinuxBuildImage.STANDARD_6_0,
            },
            timeout: Duration.minutes(10),
         },
         selfMutationCodeBuildDefaults: {
            buildEnvironment: {
               computeType: aws_codebuild.ComputeType.SMALL,
               buildImage: aws_codebuild.LinuxBuildImage.STANDARD_6_0,
            },
            timeout: Duration.minutes(10),
         },
         assetPublishingCodeBuildDefaults: {
            buildEnvironment: {
               computeType: aws_codebuild.ComputeType.SMALL,
               buildImage: aws_codebuild.LinuxBuildImage.STANDARD_6_0,
            },
            timeout: Duration.minutes(10),
         },
      } as pipelines.CodePipelineProps;

      /** mainpipeline for project */
      const mainPipeline = new pipelines.CodePipeline(this, 'MainPipeline', {
         ...pipelineProps,
         synth: new pipelines.ShellStep('Synth', {
            input: pipelines.CodePipelineSource.codeCommit(
               aws_codecommit.Repository.fromRepositoryName(this, 'CodeCommit', 'aws-cdk-custom-build-deploy-static-website-pipeline'),
               'dev',
            ),
            installCommands: ['yarn set version 3.2.1', 'yarn install'],
            commands: ['yarn synth'],
            primaryOutputDirectory: 'cdk.out',
         }),
         publishAssetsInParallel: true,
         selfMutation: true,
      });

      mainPipeline.addStage(new DevStage(this, 'DevStage', { ...props }));

      mainPipeline.addStage(new ProdStage(this, 'ProdStage', { ...props }));
   }
}
