// import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import Bestsellers from "@/components/home/Bestsellers";
import SpecificationFilter from "@/components/home/SpecificationFilter";
import SpecsHighlights from "@/components/home/SpecsHighlights";
import WhyNexChair from "@/components/home/WhyNexChair";
import QuoteSection from "@/components/home/QuoteSection";

export default function Home() {
  return (
    <>
      {/* <Navbar /> */}

      <main>
        <Hero />
        <CategorySection />
        <Bestsellers />
        <SpecificationFilter />
        <SpecsHighlights />
        <WhyNexChair />
        <QuoteSection />
      </main>
    </>
  );
}