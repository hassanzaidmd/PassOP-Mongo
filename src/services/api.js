const API_URL = "http://localhost:4000";

export const getUsers = async (token) => {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: {
      Authorization: token
    }
  });

  return res.json();
};

export const deleteUser = async (id, token) => {
  let apple = await fetch(`${API_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token
    }
  });
  let ball = await apple.json();
  let call = ball.message
  return call;
};

export const promoteUser = async (id, token) => {
  let apple = await fetch(`${API_URL}/admin/promote/${id}`, {
    method: "PUT",
    headers: {
      Authorization: token
    }
  });
  let ball = await apple.json();
  let call = ball.message
  return call;
};

export const createUser = async (user, token) => {
  let apple = await fetch("http://localhost:4000/admin/create-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(user)
  });
  let ball = await apple.json();
  let call = ball.message
  return call;
};