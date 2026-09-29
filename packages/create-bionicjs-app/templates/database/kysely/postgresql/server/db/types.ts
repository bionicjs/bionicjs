import type { Generated } from "kysely";

export interface Database {
  user: {
    id: Generated<number>;
    email: string;
    name: string | null;
    created_at: Generated<Date>;
  };
}