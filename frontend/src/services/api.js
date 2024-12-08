const apiGatewayUrl = 'http://localhost:3100';

export const createRoom = async (roomId, username) => {
  const response = await fetch(`${apiGatewayUrl}/room/create-room`, {
    method: 'POST',
    body: JSON.stringify({ roomId, username }),
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

export const joinRoom = async (roomId, username) => {
  const response = await fetch(`${apiGatewayUrl}/room/join-room`, {
    method: 'POST',
    body: JSON.stringify({ roomId, username }),
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};
