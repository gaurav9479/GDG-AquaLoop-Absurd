export const isStrongPassword = (password) => {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};
