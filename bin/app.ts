import { App } from 'aws-cdk-lib';
import { TestStack } from 'lib/test-stack';

const app = new App();

new TestStack(app, 'TestStack');
