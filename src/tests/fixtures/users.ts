import { Roles } from "../../shared/enums";
import { UserUpdateAttributes } from "../../shared/types";

export const superAdmin: UserUpdateAttributes = {
  id: "8a8682a6-2058-450c-aaff-bce3543ce5b7",
  lastName: "Rafart",
  firstName: "Francisco",
  email: "francisco.rafart@gmail.com",
  role: Roles.Superadmin,
  encryptedPassword: "j0f8wyh4nr4lwrkfewr",
  confirmed: false,
};

export const admin: UserUpdateAttributes = {
  id: "05ceb47c-2a00-4488-9a81-2edb5f33a92b",
  firstName: "Bruce",
  lastName: "Dickinson",
  email: "bruce@dickinson.com",
  role: Roles.Admin,
  encryptedPassword: "j0f8wyh4nr4lwrkfewr",
  confirmed: true,
};

export const admin2: UserUpdateAttributes = {
  id: "69f727d2-781e-42ae-9c13-0d9678e4ff2b",
  firstName: "Steve",
  lastName: "Harris",
  email: "steve@harris.com",
  role: Roles.Admin,
  encryptedPassword: "j0f8wyh4nr4lwrkfewr",
  confirmed: true,
};

export const clientUser1: UserUpdateAttributes = {
  id: "f3e7d48f-967a-4f3b-b0ed-449751f4c10f",
  firstName: "Grupy",
  lastName: "Morales",
  email: "grupy@morales.com",
  role: Roles.Reader,
  encryptedPassword: "j0f8wyh4nr4lwrkfewr",
  confirmed: true,
};

export const clientUser2: UserUpdateAttributes = {
  id: "8db5916c-2874-42d9-a7f3-1fb5ec785eda",
  firstName: "Rodrigo",
  lastName: "Suarez",
  email: "rodrigo@suarez.com",
  role: Roles.Reader,
  encryptedPassword: "j0f8wyh4nr4lwrkfewr",
  confirmed: true,
};
