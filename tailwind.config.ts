
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced colors for the wallet flow visualizer
				inflow: {
					DEFAULT: '#3b82f6', // blue-500
					light: '#93c5fd', // blue-300
					dark: '#1d4ed8', // blue-700
				},
				outflow: {
					DEFAULT: '#ef4444', // red-500
					light: '#fca5a5', // red-300
					dark: '#b91c1c', // red-700
				},
				wallet: {
					DEFAULT: '#6366f1', // indigo-500
					light: '#a5b4fc', // indigo-300 
					dark: '#4338ca', // indigo-700
				},
				graph: {
					background: '#0D1117', // Dark background color
					grid: '#1F2937', // Grid line color
					highlight: '#4f46e5', // Highlight color
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'node-selected': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' }
				},
				'pulse-glow': {
					'0%, 100%': { filter: 'drop-shadow(0 0 3px rgba(79, 139, 250, 0.7))' },
					'50%': { filter: 'drop-shadow(0 0 10px rgba(79, 139, 250, 0.9))' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.2s ease-out',
				'fade-out': 'fade-out 0.2s ease-out',
				'node-selected': 'node-selected 0.3s ease-in-out',
				'pulse-glow': 'pulse-glow 2s infinite ease-in-out'
			},
			boxShadow: {
				'node': '0 4px 14px 0 rgba(0, 0, 0, 0.3)',
				'node-selected': '0 0 0 2px rgba(79, 139, 250, 0.8), 0 4px 14px 0 rgba(0, 0, 0, 0.3)',
				'glow-blue': '0 0 15px rgba(59, 130, 246, 0.6)',
				'glow-red': '0 0 15px rgba(239, 68, 68, 0.6)',
			},
			backdropFilter: {
				'xs': 'blur(2px)',
				'sm': 'blur(4px)',
				'md': 'blur(8px)',
				'lg': 'blur(12px)',
				'xl': 'blur(16px)',
				'2xl': 'blur(24px)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
