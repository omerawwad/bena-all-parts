import { supabase } from '../lib/supabase';

/**
 * Generic function to fetch all rows from a table.
 * @param tableName - Name of the table.
 */
export async function fetchAll(tableName: string) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) throw new Error(`Error fetching data from ${tableName}: ${error.message}`);
  return data || [];
}

/**
 * Generic function to insert a row into a table.
 * @param tableName - Name of the table.
 * @param payload - The row data to insert.
 */
export async function insertRow(tableName: string, payload: any) {
  const { data, error } = await supabase.from(tableName).insert(payload).single();
  if (error) throw new Error(`Error inserting into ${tableName}: ${error.message}`);
  return data;
}

/**
 * Generic function to update a row in a table.
 * @param tableName - Name of the table.
 * @param match - The conditions to match the row.
 * @param payload - The updated data.
 */
// export async function updateRow(tableName: string, match: any, payload: any) {
//   const { data, error } = await supabase.from(tableName).update(payload).match(match).single();
//   if (error) throw new Error(`Error updating ${tableName}: ${error.message}`);
//   return data;
// }

/**
 * Generic function to delete a row in a table.
 * @param tableName - Name of the table.
 * @param match - The conditions to match the row.
 */
// export async function deleteRow(tableName: string, match: any): Promise<void> {
//   const { error } = await supabase.from(tableName).delete().match(match);
//   if (error) throw new Error(`Error deleting from ${tableName}: ${error.message}`);
// }
