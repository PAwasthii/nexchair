const stats = [
  { value: "13+", label: "Years in seating" },
  { value: "1500+", label: "Offices furnished" },
  { value: "1 year", label: "Warranty on every chair" },
  { value: "Pan-India", label: "Delivery & service coverage" },
];

export default function CompanyStats() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ value, label }) => (
        <div
          key={label}
          className="rounded-2xl border border-black/10 bg-white p-5 md:p-6"
        >
          <p className="text-3xl font-bold text-[#0E3159] sm:text-4xl">
            {value}
          </p>
          <p className="mt-2 text-sm leading-5 text-black/50">{label}</p>
        </div>
      ))}
    </div>
  );
}
