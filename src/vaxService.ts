/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { addMonths, format, parseISO } from "date-fns";
import { Species, Vaccination } from "./types";

export interface VaxProtocol {
  name: string;
  species: Species;
  shots: {
    name: string;
    startAgeMonths: number;
    intervalMonths: number;
    repeatYearly: boolean;
  }[];
}

export const VAX_PROTOCOLS: VaxProtocol[] = [
  {
    name: "Standard Canine Protocol",
    species: Species.Dog,
    shots: [
      { name: "DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)", startAgeMonths: 2, intervalMonths: 1, repeatYearly: true },
      { name: "Rabies", startAgeMonths: 3, intervalMonths: 12, repeatYearly: true },
      { name: "Leptospirosis", startAgeMonths: 3, intervalMonths: 1, repeatYearly: true },
    ],
  },
  {
    name: "Cattle Herd Health",
    species: Species.Cattle,
    shots: [
      { name: "Foot and Mouth Disease (FMD)", startAgeMonths: 4, intervalMonths: 6, repeatYearly: true },
      { name: "Anthrax & Blackquarter", startAgeMonths: 6, intervalMonths: 12, repeatYearly: true },
      { name: "Lumpy Skin Disease", startAgeMonths: 6, intervalMonths: 12, repeatYearly: true },
    ],
  },
];

export function generateSuggestedSchedule(species: Species, ageMonths: number, history: Vaccination[]): Partial<Vaccination>[] {
  const protocol = VAX_PROTOCOLS.find(p => p.species === species);
  if (!protocol) return [];

  const suggestions: Partial<Vaccination>[] = [];
  const administeredNames = new Set(history.map(v => v.vaccineName));

  protocol.shots.forEach(shot => {
    // Determine mock manufacturer for suggestions
    const manufacturer = shot.name.includes("DHPP") || shot.name.includes("Rabies") ? "Zoetis Inc." : "Boehringer Ingelheim";
    const mockLot = "BN-" + Math.floor(Math.random() * 9000 + 1000);

    // If never administered and age is appropriate
    if (!administeredNames.has(shot.name) && ageMonths >= shot.startAgeMonths) {
      suggestions.push({
        vaccineName: shot.name,
        nextDueDate: format(new Date(), "yyyy-MM-dd"), // Suggest today if overdue
        status: "Upcoming",
        manufacturer,
        lotNumber: mockLot
      });
    } 
    
    // If administered, check for booster
    const vaxHistory = history.filter(v => v.vaccineName === shot.name && v.status === "Administered");
    const lastShot = vaxHistory.sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime())[0];

    if (lastShot) {
      const nextDate = addMonths(parseISO(lastShot.dateAdministered), shot.intervalMonths);
      // Only suggest if not already in "Upcoming" status for this vaccine
      const currentUpcoming = history.find(v => v.vaccineName === shot.name && v.status === "Upcoming");
      
      if (!currentUpcoming) {
        suggestions.push({
          vaccineName: shot.name,
          nextDueDate: format(nextDate, "yyyy-MM-dd"),
          status: "Upcoming",
          manufacturer: lastShot.manufacturer || manufacturer,
          lotNumber: mockLot
        });
      }
    }
  });

  return suggestions;
}
