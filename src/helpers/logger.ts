const test = process.env.NODE_ENV === "test";
export const log = (msg: string) => {
  // TODO: Add event tracking

  if (!test) {
    console.log(msg);
  }
};

export const logError = (msg: string) => {
  if (!test) {
    console.error(msg);
  }
};
