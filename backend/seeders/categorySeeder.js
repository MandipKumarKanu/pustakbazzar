require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const connectDB = require("../config/db");

const categories = [
  { categoryName: "Academic Books" },
  { categoryName: "School Textbooks" },
  { categoryName: "College Textbooks" },
  { categoryName: "Engineering" },
  { categoryName: "Medical" },
  { categoryName: "Computer Science" },
  { categoryName: "Mathematics" },
  { categoryName: "Science" },
  { categoryName: "Business Studies" },
  { categoryName: "Economics" },
  { categoryName: "Law" },
  { categoryName: "Management" },
  
  { categoryName: "Nepali Literature" },
  { categoryName: "English Literature" },
  { categoryName: "Hindi Literature" },
  { categoryName: "Fiction" },
  { categoryName: "Non-Fiction" },
  { categoryName: "Poetry" },
  { categoryName: "Drama" },
  { categoryName: "Short Stories" },
  { categoryName: "Novels" },
  { categoryName: "Classic Literature" },
  
  { categoryName: "Hindu Scriptures" },
  { categoryName: "Buddhist Books" },
  { categoryName: "Religious Studies" },
  { categoryName: "Spirituality" },
  { categoryName: "Yoga & Meditation" },
  { categoryName: "Philosophy" },
  
  { categoryName: "Children's Books" },
  { categoryName: "Young Adult" },
  { categoryName: "Comic Books" },
  { categoryName: "Educational Games" },
  { categoryName: "Picture Books" },
  { categoryName: "Fairy Tales" },
  
  { categoryName: "Nepali History" },
  { categoryName: "World History" },
  { categoryName: "Culture & Tradition" },
  { categoryName: "Biography" },
  { categoryName: "Autobiography" },
  { categoryName: "Geography" },
  
  { categoryName: "Self Help" },
  { categoryName: "Personal Development" },
  { categoryName: "Career Development" },
  { categoryName: "Leadership" },
  { categoryName: "Psychology" },
  { categoryName: "Health & Fitness" },
  
  { categoryName: "Professional Development" },
  { categoryName: "Technical Manuals" },
  { categoryName: "Reference Books" },
  { categoryName: "Dictionaries" },
  { categoryName: "Encyclopedias" },
  { categoryName: "Research Papers" },
  
  { categoryName: "Art & Design" },
  { categoryName: "Music" },
  { categoryName: "Photography" },
  { categoryName: "Cooking" },
  { categoryName: "Gardening" },
  { categoryName: "Sports" },
  { categoryName: "Travel" },
  
  { categoryName: "English Learning" },
  { categoryName: "Nepali Grammar" },
  { categoryName: "Hindi Learning" },
  { categoryName: "Foreign Languages" },
  
  { categoryName: "SEE Preparation" },
  { categoryName: "Plus Two Preparation" },
  { categoryName: "Engineering Entrance" },
  { categoryName: "Medical Entrance" },
  { categoryName: "MBA Entrance" },
  { categoryName: "Civil Service" },
  { categoryName: "Banking Exams" },
  
  { categoryName: "Agriculture" },
  { categoryName: "Environment" },
  { categoryName: "Politics" },
  { categoryName: "Social Issues" },
  { categoryName: "Current Affairs" },
  { categoryName: "Journalism" }
];

const seedCategories = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB successfully!");

    console.log("Clearing existing categories...");
    await Category.deleteMany({});
    console.log("Inserting new categories...");
    const insertedCategories = await Category.insertMany(categories);
    
    console.log(`✅ Successfully inserted ${insertedCategories.length} categories:`);
    insertedCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.categoryName} (ID: ${category._id})`);
    });

    console.log("\n🎉 Category seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

if (require.main === module) {
  seedCategories();
}

module.exports = { seedCategories, categories };
