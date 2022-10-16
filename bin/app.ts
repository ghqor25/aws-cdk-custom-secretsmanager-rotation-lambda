import { App } from 'aws-cdk-lib';
import { PipelineStack } from 'lib/stacks/pipeline';

const app = new App();

new PipelineStack(app, 'MainPipeline', {});
