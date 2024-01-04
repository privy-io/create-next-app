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
			backgroundImage: (theme) => ({
				"neon-gradient": "linear-gradient(45deg, #4D4DFF, #FF6AD5)",
				"neon-radial-gradient": "radial-gradient(circle at center, #4D4DFF, #FF6AD5)", // Replace with your actual gradient
			}),
			borderRadius: {
				xl: "1rem",
			},
		},
	},
	plugins: [require("@tailwindcss/forms")],
};
