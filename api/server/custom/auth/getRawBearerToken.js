const getRawBearerToken = (req) => {
  const authHeader = req?.headers?.authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return undefined;
  }

  const prefix = 'Bearer ';
  if (authHeader.startsWith(prefix)) {
    return authHeader.slice(prefix.length);
  }

  return undefined;
};

module.exports = { getRawBearerToken };
