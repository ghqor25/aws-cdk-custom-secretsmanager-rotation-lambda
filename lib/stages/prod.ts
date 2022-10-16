import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FrontendStack } from 'lib/stacks/frontend';

export class ProdStage extends Stage {
   constructor(scope: Construct, id: string, props: StageProps) {
      super(scope, id, props);

      new FrontendStack(this, 'FrontendStack', { resourceBeingDifferentWithStage: 'prod' });
   }
}
