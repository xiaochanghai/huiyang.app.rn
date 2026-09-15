const colors = require('./src/components/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
      },
      colors,
      // 自定义字体大小 - Android 默认值（较小）
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['12px', '16px'],
      base: ['14px', '20px'],
      lg: ['16px', '24px'],
      xl: ['18px', '28px'],
      '2xl': ['20px', '28px'],
      '3xl': ['24px', '32px'],
      '4xl': ['26px', '32px'],
      '5xl': ['28px', '36px'],
    },
  },
  plugins: [],
};
