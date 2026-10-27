import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import SpecificationFilter from "@/components/home/SpecificationFilter";
import SpecsHighlights from "@/components/home/SpecsHighlights";
import HomeBottomCTA from "@/components/home/HomeBottomCTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategorySection />
      <SpecificationFilter />
      <SpecsHighlights />
      <HomeBottomCTA />
    </main>
  );
}
