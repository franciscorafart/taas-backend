export const signUpPasswordValid = (pw: string) => {
  // Regular expressions for each condition
  const lengthRegex = /.{8,}/;
  const letterRegex = /[a-zA-Z]/;
  const numberRegex = /\d/;
  // const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;

  // Check each condition
  const hasLength = lengthRegex.test(pw);
  const hasLetter = letterRegex.test(pw);
  const hasNumber = numberRegex.test(pw);
  // const hasSymbol = symbolRegex.test(pw);

  // Return true if all conditions are met, otherwise false
  return hasLength && hasLetter && hasNumber;
};
