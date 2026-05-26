import "dotenv/config";
import fs from "fs";
import path from "path";
import { pool } from "@/lib/db";

type Restaurant = {
  info: {
    id: string;
    name: string;
    cloudinaryImageId: string;
    areaName: string;
    cuisines: string[];
    avgRatingString: string;
  };
};

async function importRestaurants() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "restaurants.json"
    );

    const rawData = fs.readFileSync(
      filePath,
      "utf-8"
    );

    const data: Restaurant[] = JSON.parse(rawData);

    for (const item of data) {
      const info = item.info;

      await pool.query(
        `
        INSERT INTO restaurants
        (
          id,
          name,
          cloudinary_image_id,
          area_name,
          cuisines,
          avg_rating_string
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          info.id,
          info.name,
          info.cloudinaryImageId,
          info.areaName,
          info.cuisines.join(", "),
          info.avgRatingString,
        ]
      );

      console.log(`Inserted: ${info.name}`);
    }

    console.log("Import complete");
  } catch (err) {
    console.error("Import failed:", err);
  } finally {
    await pool.end();
  }
}

importRestaurants();