const stats = [
  { value: "13+", label: "Years in seating", highlight: false },
  { value: "1500+", label: "Offices furnished", highlight: false },
  { value: "1 year", label: "Warranty on every chair", highlight: true },
  { value: "Pan-India", label: "Delivery & service coverage", highlight: false },
];

export default function CompanyStats() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ value, label, highlight }) => (
        <div
          key={label}
          className="rounded-2xl border border-black/10 bg-white p-5 md:p-6"
        >
          <p className="text-3xl font-bold text-[#0E3159] sm:text-4xl">
            {value}
          </p>
          <p className={`mt-2 leading-5 ${highlight ? "text-sm font-semibold text-black/80" : "text-sm text-black/50"}`}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
