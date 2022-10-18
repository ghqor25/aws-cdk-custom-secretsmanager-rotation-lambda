# Aws Cdk Custom Construct
Custom aws cdk lambda for aws cdk secretsmanager rotationLambda.

It's just for rotate secret value, not using databases.
So It skips setSecret, testSecret, only does createSecret, finishSecret.

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