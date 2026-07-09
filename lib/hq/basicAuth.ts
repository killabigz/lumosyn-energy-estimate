export type HqBasicCredentials = {
  password: string;
  username: string;
};

export function getConfiguredHqCredentials(): HqBasicCredentials | null {
  const username = process.env.HQ_BASIC_AUTH_USER?.trim();
  const password = process.env.HQ_BASIC_AUTH_PASSWORD?.trim();

  if (!username || !password) {
    return null;
  }

  return {
    password,
    username,
  };
}

export function parseBasicAuthorization(
  value: string | null,
): HqBasicCredentials | null {
  if (!value) {
    return null;
  }

  const [scheme, encodedCredentials] = value.split(" ");

  if (scheme !== "Basic" || !encodedCredentials) {
    return null;
  }

  try {
    const decodedCredentials = atob(encodedCredentials);
    const separatorIndex = decodedCredentials.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

    return {
      password: decodedCredentials.slice(separatorIndex + 1),
      username: decodedCredentials.slice(0, separatorIndex),
    };
  } catch {
    return null;
  }
}

export function isValidHqBasicAuthorization(value: string | null) {
  const configuredCredentials = getConfiguredHqCredentials();
  const providedCredentials = parseBasicAuthorization(value);

  return (
    !!configuredCredentials &&
    !!providedCredentials &&
    providedCredentials.username === configuredCredentials.username &&
    providedCredentials.password === configuredCredentials.password
  );
}
