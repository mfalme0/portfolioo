import type { Metadata } from "next";
import { SkyBackdrop } from "@/components/sky/SkyBackdrop";
import { ScrollShell } from "@/components/ScrollShell";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { RepoGrid } from "@/components/sections/RepoGrid";
import { Stack } from "@/components/sections/Stack";
import { Contributions } from "@/components/sections/Contributions";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Mfalme — Software Engineer",
  description:
    "Joseph Gitau — software engineer building transaction reliability systems, AI SRE tooling, and self-hosted software. Nairobi, Kenya.",
};

export default function HomePage() {
  return (
    <ScrollShell>
      <SkyBackdrop />
      <Header />
      <main id="main">
        <Hero />
        <FeaturedWork />
        <RepoGrid />
        <Stack />
        <Contributions />
        <Contact />
      </main>
      <Footer />
    </ScrollShell>
  );
}
