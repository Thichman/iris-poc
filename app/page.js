import { fetchSalesforceTables } from "@/utils/salesforce/pull-tables";

export default function Home() {
  const tables = fetchSalesforceTables();
  console.log(tables);
  return (
    <div className="p-6">
      hello
    </div>
  );
}
