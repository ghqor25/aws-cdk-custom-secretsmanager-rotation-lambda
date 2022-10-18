# Aws Cdk Custom Construct
Custom aws cdk lambda for aws cdk secretsmanager rotationLambda.

It's just for rotating secret value with provided generateStringOptions.

So It skips setSecret, testSecret, only implements createSecret, finishSecret in overall rotating steps.

Generating new secret value is done with ( GetRandomPasswordCommand / @aws-sdk/client-secrets-manager )

## Usage
```typescript
    const secret = new aws_secretsmanager.Secret(this, 'Secret', {
        removalPolicy: RemovalPolicy.DESTROY,
        generateSecretString: { excludePunctuation: true, includeSpace: false, passwordLength: 40 },
    });

    secret.addRotationSchedule('SecretRotate', {
        automaticallyAfter: Duration.days(30),
        rotationLambda: new RotationLambda(this, 'RotationLambda', {
        secret,
        generateStringOptions: { excludePunctuation: true, includeSpace: false, passwordLength: 40 },
        }).lambdaFunction,
    });
```