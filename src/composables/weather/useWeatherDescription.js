// Maps WMO weather codes to condition label, description text, and background image.
// Used by WeatherHero and any component that needs to interpret a weather code.

const CONDITIONS = [
  {
    codes: [0, 1, 2, 3],
    label: 'Clear Sky',
    description: 'Enjoy the beautiful clear skies today. With plenty of sunshine and light clouds drifting by, it\'s a perfect day to spend time outdoors, take a long walk, or finally tackle any activity you\'ve been putting off.',
    background: '/weather/clear.jpg',
  },
  {
    codes: [45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82],
    label: 'Rainy Day',
    description: 'Wet conditions are expected throughout the day. Grab your umbrella and a warm jacket before heading out. A perfect excuse to slow down, enjoy a hot drink, and embrace the cosy atmosphere indoors.',
    background: '/weather/rain.jpg',
  },
  {
    codes: [71, 73, 75],
    label: 'Snowy Day',
    description: 'Snowfall is expected today, blanketing everything in a peaceful layer of white. Dress warmly in layers and take extra care on slippery roads and pavements before heading out.',
    background: '/weather/snow.jpg',
  },
  {
    codes: [95, 96, 99],
    label: 'Thunderstorm',
    description: 'Severe thunderstorms are forecast with heavy rain and lightning. It\'s best to stay indoors, avoid open areas, and keep an eye on local weather warnings until conditions improve.',
    background: '/weather/storm.jpg',
  },
]

// Returns the matching condition object for a given WMO weather code.
// Falls back to Clear Sky if the code is unrecognised.
export function useWeatherDescription(code) {
  const match = CONDITIONS.find(c => c.codes.includes(code))
  return match ?? CONDITIONS[0]
}
