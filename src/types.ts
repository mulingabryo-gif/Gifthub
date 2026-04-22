/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Species {
  Cattle = "Cattle",
  Goat = "Goat",
  Sheep = "Sheep",
  Dog = "Dog",
  Cat = "Cat",
  Poultry = "Poultry",
  Horse = "Horse",
}

export enum VisitStatus {
  Scheduled = "Scheduled",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface Vaccination {
  id: string;
  vaccineName: string;
  dateAdministered: string;
  manufacturer?: string;
  lotNumber?: string;
  nextDueDate: string;
  status: "Administered" | "Overdue" | "Upcoming";
}

export interface Patient {
  id: string;
  name: string;
  species: Species;
  breed: string;
  ownerName: string;
  ownerPhone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  ageMonths: number;
  lastVisit?: string;
  weightTrend: { date: string; weight: number }[];
  vaccinations: Vaccination[];
  tags?: string[];
  microchipId?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  startTime: string;
  endTime?: string;
  status: VisitStatus;
  type: "Farm Visit" | "Clinic" | "Emergency";
  soap?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  medications: {
    name: string;
    dose: string;
    route: string;
    cost: number;
  }[];
  billing: {
    amount: number;
    paid: boolean;
    mpesaRef?: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minLevel: number;
  isControlled: boolean;
  expiryDate?: string;
}
