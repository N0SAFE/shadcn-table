import { getTasks } from "@/app/_lib/queries";
import { type GetTasksSchema } from "@/app/_lib/validations";
import { NextResponse } from "next/server";
import { type Filter, type FilterAdapter } from "@/config/data-table";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");
    const sorting = JSON.parse(searchParams.get("sort") || "[]");
    const rawFilters = JSON.parse(searchParams.get("filters") || "[]");
    const joinOperator = (searchParams.get("joinOperator") || "and") as "and" | "or";
    const rawFlags = searchParams.get("flags")?.split(",") || [];
    
    // Validate filters and flags
    const filters = rawFilters as Filter<FilterAdapter>[];
    const flags = rawFlags.filter((flag): flag is "advancedTable" | "floatingBar" => 
      flag === "advancedTable" || flag === "floatingBar"
    );
    
    // Call getTasks with parsed parameters
    const input: GetTasksSchema = {
      page,
      perPage,
      sort: sorting,
      filters,
      joinOperator,
      flags,
      // Default values for backwards compatibility
      title: "",
      status: [],
      priority: [],
      from: "",
      to: "",
    };

    const result = await getTasks(input);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}