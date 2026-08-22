import Image from 'next/image'
import { Star } from 'lucide-react'

const customers = [
  {
    name: 'Rahul Sharma',
    location: 'Mumbai',
    image: '/customers/customer-1.jpg',
    rating: 5,
    testimonial: 'Got my loan approved in just 3 minutes. Amazing experience!',
  },
  {
    name: 'Priya Patel',
    location: 'Bangalore',
    image: '/customers/customer-2.jpg',
    rating: 5,
    testimonial: 'The AI chatbot made everything so simple. Highly recommend!',
  },
  {
    name: 'Arjun Kumar',
    location: 'Delhi',
    image: '/customers/customer-3.jpg',
    rating: 5,
    testimonial: 'No paperwork, no hassle. Best loan experience ever.',
  },
  {
    name: 'Sneha Reddy',
    location: 'Hyderabad',
    image: '/customers/customer-4.jpg',
    rating: 5,
    testimonial: 'Transparent rates and instant approval. Love SanctionX!',
  },
  {
    name: 'Vikram Singh',
    location: 'Chennai',
    image: '/customers/customer-5.jpg',
    rating: 5,
    testimonial: 'Professional service with competitive interest rates.',
  },
]

export function HappyCustomers() {
  return (
    <section className="bg-muted/30 py-12 px-4 border-y border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Text */}
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
              Trusted by thousands
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              Join 50,000+ Happy Customers
            </h3>
          </div>

          {/* Right side - Customer avatars and rating */}
          <div className="flex items-center gap-6">
            {/* Stacked avatars */}
            <div className="flex -space-x-3">
              {customers.map((customer, index) => (
                <div
                  key={customer.name}
                  className="relative w-12 h-12 rounded-full border-3 border-background overflow-hidden shadow-md hover:scale-110 hover:z-10 transition-transform"
                  style={{ zIndex: customers.length - index }}
                >
                  <Image
                    src={customer.image || "/placeholder.svg"}
                    alt={customer.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                <span className="font-semibold text-foreground">4.8/5</span> from 10,000+ reviews
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial carousel on mobile */}
        <div className="mt-8 md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {customers.slice(0, 3).map((customer) => (
              <div
                key={customer.name}
                className="flex-shrink-0 w-[280px] bg-card border border-border rounded-xl p-4 snap-center"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={customer.image || "/placeholder.svg"}
                      alt={customer.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.location}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  &quot;{customer.testimonial}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
