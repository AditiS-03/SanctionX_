'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle2, FileUp, FileCheck } from 'lucide-react'

const steps = [
  { icon: MessageSquare, label: 'Tell us your loan need', description: 'Share your requirements' },
  { icon: CheckCircle2, label: 'Quick eligibility check', description: 'Instant AI assessment' },
  { icon: FileUp, label: 'Upload documents', description: 'Simple document scan' },
  { icon: FileCheck, label: 'Get sanction letter', description: 'Receive approval instantly' },
]

export function StepperSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section id="how-it-works" className="bg-background py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 font-[family-name:var(--font-heading)]">
            Your Loan Journey
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Four simple steps to get your personal loan sanctioned
          </p>
        </div>

        {/* Desktop Stepper */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-7 left-0 right-0 h-1 bg-border rounded-full mx-[72px]" />
            
            {/* Active Progress Bar */}
            <div 
              className="absolute top-7 left-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out mx-[72px]"
              style={{ width: `calc(${(activeStep / (steps.length - 1)) * 100}% - ${activeStep === steps.length - 1 ? 0 : 72}px)` }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.label}
                  className="flex flex-col items-center cursor-pointer group"
                  onMouseEnter={() => setActiveStep(index)}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index <= activeStep
                        ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg scale-110'
                        : 'bg-card border-2 border-border text-muted-foreground group-hover:border-primary/50 group-hover:scale-105'
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-center">
                    <span className={`text-sm font-semibold block transition-colors ${
                      index <= activeStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {step.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                index <= activeStep
                  ? 'bg-primary/5 border border-primary/20'
                  : 'bg-card border border-border'
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  index <= activeStep
                    ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div>
                <span className={`text-sm font-semibold block ${
                  index <= activeStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {step.description}
                </span>
              </div>
              <div className={`ml-auto w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                index <= activeStep 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Average approval time: <span className="font-semibold text-foreground">5 minutes</span>
        </p>
      </div>
    </section>
  )
}
