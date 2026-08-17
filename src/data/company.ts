import type { Company } from "../types/fleet";

export const demoCompany: Company = {
  name: "Charlie Company",
  unit: "63D ESB-E",
  platoons: [
    {
      id: "Headquarters",
      name: "Headquarters",
      vehicles: [
        { id: "HQ-6", bumper: "HQ-6", type: "M11A65" },
        { id: "C-7", bumper: "C-7", type: "M11A51" },
        { id: "C-30", bumper: "C-30", type: "M11A51" },
        { id: "C-31", bumper: "C-31", type: "M11A51" },
        { id: "C-32", bumper: "C-32", type: "M11A51" },
        { id: "C-33", bumper: "C-33", type: "M11A51" },
        { id: "C-40", bumper: "C-40", type: "M1078" },
      ],
    },
    {
      id: "1st-platoon",
      name: "1st Platoon",
      vehicles: [
        { id: "C-106", bumper: "C-106", type: "M11A51" },
        { id: "C-111", bumper: "C-111", type: "M11A51" },
        { id: "C-112", bumper: "C-112", type: "M11A51" },
        { id: "C-113", bumper: "C-113", type: "M11A51" },
        { id: "C-115", bumper: "C-115", type: "M11A65" },
        { id: "C-16", bumper: "C-16", type: "M11A65" },
        { id: "C-121", bumper: "C-121", type: "M11A51" },
        { id: "C-122", bumper: "C-122", type: "M11A51" },
        { id: "C-123", bumper: "C-123", type: "M11A51" },
        { id: "C-124", bumper: "C-124", type: "M11A65" },
        { id: "C-125", bumper: "C-125", type: "M11A65" },
        { id: "C-126", bumper: "C-126", type: "M11A65" },
      ],
    },
    {
      id: "2nd-platoon",
      name: "2nd Platoon",
      vehicles: [
        { id: "C-211", bumper: "C-211", type: "M11A51" },
        { id: "C-212", bumper: "C-212", type: "M11A51" },
        { id: "C-213", bumper: "C-213", type: "M11A51" },
        { id: "C-214", bumper: "C-214", type: "M11A65" },
        { id: "C-215", bumper: "C-215", type: "M11A65" },
        { id: "C-216", bumper: "C-216", type: "M11A65" },
        { id: "C-221", bumper: "C-221", type: "M11A51" },
        { id: "C-222", bumper: "C-222", type: "M11A51" },
        { id: "C-223", bumper: "C-223", type: "M11A51" },
        { id: "C-224", bumper: "C-224", type: "M11A65" },
        { id: "C-225", bumper: "C-225", type: "M11A65" },
        { id: "C-226", bumper: "C-226", type: "M11A65" },
        { id: "C-26", bumper: "C-26", type: "M11A65" },
      ],
    },
  ],
};
