import type { SessionUser } from "@/types/auth";

/** Mock team members used for auth + owner assignment in mock mode. */
export const DEFAULT_USER_EMAIL = "naomi@itrix.example";

export const MOCK_USERS: Record<string, SessionUser> = {
  "admin@itrix.example": {
    id: "u0",
    name: "Stacey",
    email: "admin@itrix.example",
    role: "Admin",
  },
  "naomi@itrix.example": {
    id: "u1",
    name: "Naomi",
    email: "naomi@itrix.example",
    role: "Success Team",
  },
  "benjamin@itrix.example": {
    id: "u2",
    name: "Benjamin",
    email: "benjamin@itrix.example",
    role: "Technical Review Team",
  },
  // A second elevated account: L4/L5 drafts need two *distinct* approvers, so
  // without this the two-approver rule is unsatisfiable in mock mode.
  "kang@itrix.example": {
    id: "u4",
    name: "Kang",
    email: "kang@itrix.example",
    role: "Assessment Team",
  },
  "fidel@itrix.example": {
    id: "u3",
    name: "Fidel",
    email: "fidel@itrix.example",
    role: "Specialist",
  },
};

export const MOCK_TEAM = Object.values(MOCK_USERS);
