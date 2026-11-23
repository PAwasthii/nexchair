export default function AnnouncementBar() {
  return (
    <div className="bg-[#0B3838] px-4 py-2.5">
      <div className="mx-auto max-w-[1360px]">
        <p className="text-center text-[12px] font-medium text-[#FFF9F0]/80 sm:hidden">
          1 year warranty on every chair
        </p>
        <div className="hidden items-center justify-center gap-0 sm:flex">
          <span className="flex items-center gap-2 text-[13px] text-[#FFF9F0]/80">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#E8AD4D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Corporate &amp; bulk orders - dedicated project desk
          </span>
          <span className="mx-5 text-[#E8AD4D]/30">|</span>
          <span className="flex items-center gap-2 text-[13px] text-[#FFF9F0]/80">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#E8AD4D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            GST invoicing for businesses
          </span>
          <span className="mx-5 text-[#E8AD4D]/30">|</span>
          <span className="flex items-center gap-2 text-[13px] text-[#FFF9F0]/80">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#E8AD4D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
            </svg>
            1 year warranty on every chair
          </span>
        </div>
      </div>
    </div>
  );
}
