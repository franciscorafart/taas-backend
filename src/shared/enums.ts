export enum Roles {
  Reader = 20,
  SuperReader = 30,
  Admin = 40,
  Superadmin = 50,
}

export enum ResponseStatus {
  Ok = "ok",
  BadRequest = "bad_request",
  Unauthorized = "unauthorized",
  Error = "server_error",
}
