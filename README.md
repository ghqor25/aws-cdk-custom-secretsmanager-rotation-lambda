# Aws Cdk Custom Construct
Simple lambda for aws cdk secretsmanager rotationLambda.
Use cases for just rotate secret value, not using databases.

## Usage
```typescript
    const secret = new aws_secretsmanager.Secret(this, 'Secret', {
        removalPolicy: RemovalPolicy.DESTROY,
        generateSecretString: { excludePunctuation: true, includeSpace: false, passwordLength: 40 },
    });

    secret.addRotationSchedule('SecretRotate', {
        automaticallyAfter: Duration.days(1),
        rotationLambda: new RotationLambda(this, 'RotationLambda', {
        secret,
        generateStringOptions: { excludePunctuation: true, includeSpace: false, passwordLength: 40 },
        }).lambdaFunction,
    });
```