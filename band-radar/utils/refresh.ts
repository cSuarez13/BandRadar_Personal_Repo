export async function refreshToken(refreshToken: string) {
  const res = await fetch('/api/auth/refresh', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await res.json();

  const newData = {
    ...data,
    refresh_token: refreshToken,
  };

  return newData;
}
