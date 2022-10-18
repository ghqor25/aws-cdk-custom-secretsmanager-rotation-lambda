import { aws_lambda, aws_lambda_nodejs, aws_secretsmanager } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface RotationLambdaProps {
   secret: aws_secretsmanager.ISecret;
   generateStringOptions?: Pick<
      aws_secretsmanager.SecretStringGenerator,
      | 'excludeCharacters'
      | 'excludeLowercase'
      | 'excludeNumbers'
      | 'excludePunctuation'
      | 'excludeUppercase'
      | 'includeSpace'
      | 'passwordLength'
      | 'requireEachIncludedType'
   >;
}

/**
 * simple lambda function to rotate secret
 */
export class RotationLambda extends Construct {
   /**
    * rotation lambda function. use this value to add rotation schedule.
    */
   public readonly lambdaFunction: aws_lambda.IFunction;
   constructor(scope: Construct, id: string, props: RotationLambdaProps) {
      super(scope, id);

      const environment = {
         EXCLUDE_CHARACTERS: props.generateStringOptions?.excludeCharacters ?? '',
         EXCLUDE_LOWERCASE: props.generateStringOptions?.excludeLowercase?.toString() ?? 'false',
         EXCLUDE_NUMBERS: props.generateStringOptions?.excludeNumbers?.toString() ?? 'false',
         EXCLUDE_PUNCTUATION: props.generateStringOptions?.excludePunctuation?.toString() ?? 'false',
         EXCLUDE_UPPERCASE: props.generateStringOptions?.excludeUppercase?.toString() ?? 'false',
         INCLUDE_SPACE: props.generateStringOptions?.includeSpace?.toString() ?? 'false',
         PASSWORD_LENGTH: props.generateStringOptions?.passwordLength?.toString() ?? '32',
         REQUIRE_EACH_INCLUDED_TYPE: props.generateStringOptions?.requireEachIncludedType?.toString() ?? 'true',
      };

      this.lambdaFunction = new aws_lambda_nodejs.NodejsFunction(this, 'RotationLambda', {
         bundling: { minify: true, sourceMap: false, sourcesContent: false, target: 'ES2020' },
         runtime: aws_lambda.Runtime.NODEJS_16_X,
         environment,
      });
   }
}
