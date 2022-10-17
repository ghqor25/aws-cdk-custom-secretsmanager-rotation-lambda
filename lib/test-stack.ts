import { aws_secretsmanager, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RotationLambda } from 'src/index';

export class TestStack extends Stack {
   constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);

      const secret = new aws_secretsmanager.Secret(this, 'Secret', {
         removalPolicy: RemovalPolicy.DESTROY,
         generateSecretString: { excludePunctuation: true, includeSpace: false, passwordLength: 40 },
      });

      secret.addRotationSchedule('SecretRotate', {
         automaticallyAfter: Duration.days(1),
         rotationLambda: new RotationLambda(this, 'RotationLambda', {
            secret,
            generateStringOptions: { excludePunctuation: true, includeSpace: false, passwordLength: 40 },
         }).rotationLambda,
      });
   }
}
