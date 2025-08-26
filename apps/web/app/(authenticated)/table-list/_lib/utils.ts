import { CheckCircle2, Circle, PauseCircle } from "lucide-react";
import type { ContactStatus } from "../type";

export const getStatusIcon = (status: ContactStatus) => {
  switch (status) {
    case "active":
      return CheckCircle2;
    case "inactive":
      return PauseCircle;
    case "draft":
    default:
      return Circle;
  }
};
