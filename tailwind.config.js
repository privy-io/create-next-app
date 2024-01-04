const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Adelle Sans", ...defaultTheme.fontFamily.sans],
			},
			colors: {
				"privy-navy": "#160B45",
				"privy-light-blue": "#EFF1FD",
				"privy-blueish": "#D4D9FC",
				"privy-pink": "#FF8271",
				neonBlue: "#4D4DFF",
				neonPink: "#FF6AD5",
			},
			backgroundImage: {
				"neon-gradient": "linear-gradient(45deg, #4D4DFF, #FF6AD5)",
				"neon-radial-gradient": "radial-gradient(circle at center, #4D4DFF, #FF6AD5)",
			},
			borderRadius: {
				xl: "1rem",
			},
			animation: {
				"spin-slow": "spin 2s linear infinite",
			},
			keyframes: {
				spin: {
					"0%": { transform: "rotate(0deg)" },
					"100%": { transform: "rotate(360deg)" },
				},
			},
		},
	},
	plugins: [require("@tailwindcss/forms")],
};
