import { connectDB } from "./db.js";
import { seedStations } from "./services/stationService.js";

const initialStations = [
  { id: "helwan", name: "Helwan", line: 1, order: 0 },
  { id: "ain-helwan", name: "Ain Helwan", line: 1, order: 1 },
  { id: "hadayek-helwan", name: "Hadayek Helwan", line: 1, order: 2 },
  { id: "maadi", name: "Maadi", line: 1, order: 10 },
  { id: "sadat", name: "Sadat", line: 1, order: 20 },
  { id: "shohadaa", name: "El-Shohadaa", line: 1, order: 25 },
  { id: "new-marg", name: "New Marg", line: 1, order: 35 },
];

async function seed() {
  try {
    await connectDB();

    console.log("Seeding stations...");

    const result = await seedStations(initialStations);

    console.log(
      `Successfully seeded ${
        result.upsertedCount + result.modifiedCount
      } stations`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding stations:", error);
    process.exit(1);
  }
}

seed();