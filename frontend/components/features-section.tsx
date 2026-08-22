import { Card, CardContent } from '@/components/ui/card'
import { FileText, Zap, Wallet } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Zero Paperwork',
    description:
      'Upload income proof via chat & complete Aadhaar eKYC in seconds.',
  },
  {
    icon: Zap,
    title: 'Instant Decision',
    description:
      'Rules-based approval engine with fraud detection and credit logic.',
  },
  {
    icon: Wallet,
    title: 'Transparent Rates',
    description:
      'View EMI, interest & Key Fact Statement before accepting.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 font-[family-name:var(--font-heading)]">
            Why Choose SanctionX?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-card border-border hover:shadow-xl transition-all hover:-translate-y-1 rounded-2xl"
            >
              <CardContent className="pt-8 pb-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 font-[family-name:var(--font-heading)]">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
