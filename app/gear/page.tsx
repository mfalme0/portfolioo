import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollShell } from "@/components/ScrollShell";
import { SkyBackdrop } from "@/components/sky/SkyBackdrop";
import { Reveal } from "@/components/motion/Reveal";

export default function GearPage() {
  return (
    <ScrollShell>
      <SkyBackdrop />
      <Header />
      <main id="main">
        <Reveal>
          <section id="gear" className="section">
            <div className="container-page">
              <p className="eyebrow">Gear</p>
              <h2 className="mt-3 text-3xl font-semibold">
                The bench
              </h2>
              <p className="mt-4 max-w-2xl text-ink-muted text-pretty">
                What the work runs on. Bought, not sponsored — these are the
                tools I actually use day to day.
              </p>

              <div className="mt-12 grid gap-8 lg:grid-cols-2">
                <article className="scrim-panel rounded-2xl p-6 sm:p-8">
                  <p className="eyebrow mb-3">Rig</p>
                  <h3 className="text-2xl font-semibold">Custom PC</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <dt className="text-ink-subtle">CPU</dt>
                      <dd className="text-ink">Ryzen 7 5800X3D</dd>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <dt className="text-ink-subtle">GPU</dt>
                      <dd className="text-ink">GeForce RTX 3080</dd>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <dt className="text-ink-subtle">Memory</dt>
                      <dd className="text-ink">32 GB DDR4-3600</dd>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <dt className="text-ink-subtle">Storage</dt>
                      <dd className="text-ink">2 TB NVMe</dd>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <dt className="text-ink-subtle">OS</dt>
                      <dd className="text-ink">Windows 11 / Arch dual-boot</dd>
                    </div>
                  </dl>
                </article>

                <article className="scrim-panel rounded-2xl p-6 sm:p-8">
                  <p className="eyebrow mb-3">Peripherals</p>
                  <h3 className="text-2xl font-semibold">Desk</h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-ink-subtle">Keyboard</span>
                      <span className="text-ink">Logitech G513</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-ink-subtle">Mouse</span>
                      <span className="text-ink">Logitech G935</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-ink-subtle">Headset</span>
                      <span className="text-ink">HyperX Cloud II</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-ink-subtle">Display</span>
                      <span className="text-ink">ASUS ROG Swift</span>
                    </li>
                  </ul>
                </article>
              </div>

              <div className="mt-12">
                <p className="eyebrow mb-3">On the bench</p>
                <h3 className="text-2xl font-semibold">Homelab</h3>
                <p className="mt-2 max-w-2xl text-ink-muted text-pretty">
                  Proxmox on an old office box, running the resume toolkit and
                  a few throwaway services. Nothing mission-critical — it breaks
                  on purpose so I learn how to fix it.
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </ScrollShell>
  );
}