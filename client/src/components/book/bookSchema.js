import { z } from "zod";

export const bookSchema = z
  .object({
    bookName: z.string().min(1, "Book name is required"),
    bookLanguage: z.string().min(1, "Language is required"),
    author: z.string().min(1, "Author is required"),
    edition: z.string().min(1, "Edition is required"),
    publishYear: z
      .string()
      .length(4, "Must be a valid year")
      .refine((year) => {
        const numYear = parseInt(year);
        const currentYear = new Date().getFullYear();
        return numYear >= 1800 && numYear <= currentYear;
      }, "Year must be between 1800 and current year"),
    bookFor: z.enum(["donation", "sell"], {
      required_error: "Please select an option",
    }),
    condition: z.string().min(1, "Condition is required"),
    markedPrice: z
      .number({
        required_error: "Marked price is required",
        invalid_type_error: "Marked price must be a number",
      })
      .nonnegative("Price cannot be negative")
      .optional(),
    sellingPrice: z
      .number({
        invalid_type_error: "Selling price must be a number",
      })
      .nonnegative("Price cannot be negative")
      .optional(),
    // description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.bookFor === "sell") {
        return (
          typeof data.markedPrice === "number" &&
          typeof data.sellingPrice === "number"
        );
      }
      return true;
    },
    {
      message: "Marked price and selling price are required for selling books",
      path: ["sellingPrice"],
    }
  );
