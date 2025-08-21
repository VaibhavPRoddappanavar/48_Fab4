import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Bot, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Eligibility", href: "/eligibility" },
  { name: "Guidance", href: "/guidance" },
  { name: "Financial Advisor", href: "/financial-advisor" },
  { name: "Education", href: "/education" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isHomePage = location.pathname === "/"

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        isHomePage ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-white" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">LukaAI</span>
              <span className="text-xs text-white/80">Financial Companion</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-white/80 hover:text-white transition-colors",
                  location.pathname === item.href && "text-white font-semibold"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden md:inline-flex bg-white/10 text-white border-white/20 hover:bg-white/20">
              Get Started
            </Button>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-white/10"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-background/90 backdrop-blur-lg pb-4"
        >
          <div className="flex flex-col items-center space-y-4 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-foreground/80 hover:text-foreground w-full text-center py-2",
                  location.pathname === item.href && "text-primary font-semibold"
                )}
              >
                {item.name}
              </Link>
            ))}
            <Button variant="hero" className="w-full max-w-[90%]">
              Get Started
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  )
}