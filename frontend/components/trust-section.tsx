import { Shield, Smartphone, FileText, Users, Star } from 'lucide-react'

const badges = [
  { icon: Shield, label: 'RBI-aligned digital lending' },
  { icon: Smartphone, label: 'Aadhaar eKYC' },
  { icon: FileText, label: 'DPDP Act compliant' },
  { icon: Users, label: 'No data sold' },
]

const stats = [
  { value: '50,000+', label: 'Applications processed' },
  { value: '92%', label: 'Instant eligibility' },
  { value: '4.8', label: 'User rating', icon: Star },
]

export function TrustSection() {
  return (
    <section className="bg-muted/50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Security First
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 font-[family-name:var(--font-heading)]">
            Trust & Compliance
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2.5 text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <badge.icon className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-[family-name:var(--font-heading)]">
                  {stat.value}
                </span>
                {stat.icon && (
                  <stat.icon className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
