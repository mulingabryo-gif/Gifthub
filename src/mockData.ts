import { Species, Patient, Visit, VisitStatus, InventoryItem } from "./types";

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Rex",
    species: Species.Dog,
    breed: "German Shepherd",
    ownerName: "John Kamau",
    ownerPhone: "0712345678",
    location: {
      lat: -1.286389,
      lng: 36.817223,
      address: "Kilimani, Nairobi",
    },
    ageMonths: 24,
    lastVisit: "2024-04-10",
    weightTrend: [
      { date: "2024-01-01", weight: 30 },
      { date: "2024-02-01", weight: 31 },
      { date: "2024-03-01", weight: 32 },
      { date: "2024-04-01", weight: 31.5 },
    ],
    vaccinations: [
      { id: "vax1", vaccineName: "Rabies", dateAdministered: "2023-04-20", nextDueDate: "2024-04-20", status: "Administered" },
      { id: "vax2", vaccineName: "DHPP", dateAdministered: "2024-01-10", nextDueDate: "2024-02-10", status: "Administered" },
    ]
  },
  {
    id: "p2",
    name: "Daisy",
    species: Species.Cattle,
    breed: "Friesian",
    ownerName: "Mary Wanjiku",
    ownerPhone: "0722123456",
    location: {
      lat: -1.045,
      lng: 37.065,
      address: "Thika, Kiambu",
    },
    ageMonths: 36,
    lastVisit: "2024-04-15",
    weightTrend: [
      { date: "2024-01-15", weight: 450 },
      { date: "2024-02-15", weight: 455 },
      { date: "2024-03-15", weight: 462 },
      { date: "2024-04-15", weight: 465 },
    ],
    vaccinations: [
      { id: "vax3", vaccineName: "Foot and Mouth Disease (FMD)", dateAdministered: "2023-11-15", nextDueDate: "2024-05-15", status: "Administered" },
    ]
  },
];

export const MOCK_VISITS: Visit[] = [
  {
    id: "v1",
    patientId: "p1",
    startTime: "2024-04-20T09:00:00",
    status: VisitStatus.Scheduled,
    type: "Clinic",
    billing: { amount: 2500, paid: false },
    medications: [],
  },
  {
    id: "v2",
    patientId: "p2",
    startTime: "2024-04-22T11:00:00",
    status: VisitStatus.Scheduled,
    type: "Farm Visit",
    billing: { amount: 5000, paid: false },
    medications: [],
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "i1",
    name: "Ketamine",
    stock: 5,
    unit: "vials",
    minLevel: 10,
    isControlled: true,
    expiryDate: "2025-12-31",
  },
  {
    id: "i2",
    name: "Penicillin",
    stock: 50,
    unit: "vials",
    minLevel: 20,
    isControlled: false,
    expiryDate: "2024-10-15",
  },
];
