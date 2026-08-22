import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { HappyCustomers } from '@/components/happy-customers'
import { FeaturesSection } from '@/components/features-section'
import { StepperSection } from '@/components/stepper-section'
import { TrustSection } from '@/components/trust-section'
import { ChatbotEmbed } from '@/components/chatbot-embed'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />

      <HeroSection />

      <HappyCustomers />

      <section id="features">
        <FeaturesSection />
      </section>

      <section id="how-it-works">
        <StepperSection />
      </section>

      <TrustSection />

      <ChatbotEmbed />

      <Footer />
    </main>
  )
}
