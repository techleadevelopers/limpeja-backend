const TEST_DB_HOSTS = ['localhost', '127.0.0.1'];
const TEST_DB_PORT = '5433';
const TEST_DB_NAME = 'app_test';
const TEST_REDIS_HOSTS = ['localhost', '127.0.0.1'];
const TEST_REDIS_PORT = '6380';

type UrlGuardOptions = {
  value?: string;
  envVarName: string;
  allowedHosts: string[];
  requiredPort: string;
  allowedProtocols: readonly string[];
  targetLabel: string;
  requiredDatabase?: string;
};

function assertTestUrl({
  value,
  envVarName,
  allowedHosts,
  requiredPort,
  allowedProtocols,
  targetLabel,
  requiredDatabase,
}: UrlGuardOptions) {
  if (!value) {
    throw new Error(`${envVarName} is required for ${targetLabel}.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${envVarName} must be a valid URL, got '${value}'.`);
  }

  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new Error(
      `${envVarName} protocol must be one of [${allowedProtocols.join(', ')}], got '${parsed.protocol}'.`,
    );
  }

  const normalizedHost = parsed.hostname.toLowerCase();
  if (!allowedHosts.includes(normalizedHost)) {
    throw new Error(`${envVarName} host must be ${allowedHosts.join(' or ')}, got '${normalizedHost}'.`);
  }

  const port = parsed.port || requiredPort;
  if (port !== requiredPort) {
    throw new Error(`${envVarName} port must be ${requiredPort}, got '${port}'.`);
  }

  if (requiredDatabase) {
    const database = parsed.pathname?.replace(/^\//, '');
    if (database !== requiredDatabase) {
      throw new Error(
        `${envVarName} database must be '${requiredDatabase}', got '${database || '<empty>'}'.`,
      );
    }
  }

  console.log(
    `[assert-test-env] ${targetLabel} -> ${normalizedHost}:${port}${requiredDatabase ? `/${requiredDatabase}` : ''}`,
  );
}

export function assertTestDatabaseUrl(value?: string) {
  assertTestUrl({
    value,
    envVarName: 'DATABASE_URL_TEST',
    allowedHosts: TEST_DB_HOSTS,
    requiredPort: TEST_DB_PORT,
    allowedProtocols: ['postgresql:', 'postgres:'],
    targetLabel: 'PostgreSQL test database',
    requiredDatabase: TEST_DB_NAME,
  });
}

export function assertTestRedisUrl(value?: string) {
  assertTestUrl({
    value,
    envVarName: 'REDIS_URL_TEST',
    allowedHosts: TEST_REDIS_HOSTS,
    requiredPort: TEST_REDIS_PORT,
    allowedProtocols: ['redis:', 'rediss:'],
    targetLabel: 'Redis test instance',
  });
}
