<script setup>
// One component for every icon in the app: <AppIcon name="wind" />
// Size follows the surrounding font size (1em) and color follows the text color
// (currentColor), so use Tailwind classes like text-sm / text-brand on it.
defineProps({
  name: {
    type: String,
    required: true,
    // thermometer | precipitation | visibility | humidity | clock | calendar |
    // uv-index | wind | location-pin | save-location | remove-location | search
  },
})
</script>

<template>
  <!-- Feels Like -->
  <svg v-if="name === 'thermometer'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true">
    <path fill="currentColor" d="M30 18h-6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6v2h-6v10h6Z" />
    <circle cx="18" cy="4" r="2" fill="currentColor" />
    <path fill="currentColor" d="M10 20.184V12H8v8.184a3 3 0 1 0 2 0" />
    <path fill="currentColor" d="M9 30a6.993 6.993 0 0 1-5-11.89V7a5 5 0 0 1 10 0v11.11A6.993 6.993 0 0 1 9 30M9 4a3.003 3.003 0 0 0-3 3v11.983l-.332.299a5 5 0 1 0 6.664 0L12 18.983V7a3.003 3.003 0 0 0-3-3" />
  </svg>

  <!-- Precipitation -->
  <svg v-else-if="name === 'precipitation'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 2048 2048" aria-hidden="true">
    <path fill="currentColor" d="M1607 1166q28 57 42 118t15 124q0 88-23 170t-64 153t-100 129t-130 100t-153 65t-170 23t-170-23t-153-64t-129-100t-100-130t-65-153t-23-170q0-63 14-124t43-118L1024 0zm-583 754q106 0 199-40t163-109t110-163t40-200q0-48-11-95t-33-90l-468-937l-468 937q-22 43-33 90t-11 95q0 106 40 199t109 163t163 110t200 40" />
  </svg>

  <!-- Visibility -->
  <svg v-else-if="name === 'visibility'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path d="M21.257 10.962c.474.62.474 1.457 0 2.076C19.764 14.987 16.182 19 12 19s-7.764-4.013-9.257-5.962a1.69 1.69 0 0 1 0-2.076C4.236 9.013 7.818 5 12 5s7.764 4.013 9.257 5.962" />
      <circle cx="12" cy="12" r="3" />
    </g>
  </svg>

  <!-- Humidity -->
  <svg v-else-if="name === 'humidity'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2">
      <path fill="currentColor" fill-rule="evenodd" d="M14.2732 12.6667L17.2546 9.3333C17.4444 9.1212 17.7154 9 18 9C18.2846 9 18.5556 9.1212 18.7454 9.3333L21.7268 12.6667C22.5467 13.5834 23 14.7701 23 16C23 18.7614 20.7614 21 18 21C15.2386 21 13 18.7614 13 16C13 14.7701 13.4533 13.5834 14.2732 12.6667Z" clip-rule="evenodd" stroke="none" />
      <path d="M1.6 5.3L2 5C2.8655 4.3509 3.9181 4 5 4C6.0819 4 7.1345 4.3509 8 5C8.8655 5.6491 9.9181 6 11 6C12.0819 6 13.1345 5.6491 14 5C14.8655 4.3509 15.9181 4 17 4C18.0819 4 19.1345 4.3509 20 5L20.8 5.6M1.6 10.3L2 10C2.8655 9.3509 3.9181 9 5 9C6.0819 9 7.1345 9.3509 8 10C8.8655 10.6491 9.9181 11 11 11C11.2673 11 11.5342 10.9786 11.7981 10.9359L12.7853 10.7763M1.6 15.3L2 15C2.8655 14.3509 3.9181 14 5 14C6.0819 14 7.1345 14.3509 8 15C8.5921 15.4441 9.2754 15.7512 10.0006 15.8991L10.9805 16.099" />
    </g>
  </svg>

  <!-- Hourly forecast -->
  <svg v-else-if="name === 'clock'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 16l-2.414-2.414A2 2 0 0 1 12 12.172V6" />
    </g>
  </svg>

  <!-- 10-day forecast -->
  <svg v-else-if="name === 'calendar'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <rect width="20" height="18" x="2" y="4" rx="4" />
      <path d="M8 2v4m8-4v4M2 10h20" />
    </g>
  </svg>

  <!-- UV index -->
  <svg v-else-if="name === 'uv-index'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" aria-hidden="true">
    <path fill="currentColor" d="M7.417 5.833a1.584 1.584 0 1 0-3.167.001a1.584 1.584 0 0 0 3.167-.001m1 0a2.584 2.584 0 1 1-5.168 0a2.584 2.584 0 0 1 5.168 0m2-.5a.5.5 0 0 1 0 1H9.375a.5.5 0 0 1 0-1zM7.984 7.984a.5.5 0 0 1 .707 0l.737.737a.5.5 0 0 1-.707.707l-.737-.737a.5.5 0 0 1 0-.707m-2.651 2.433V9.375a.5.5 0 0 1 1 0v1.042a.5.5 0 0 1-1 0M2.976 7.984a.5.5 0 0 1 .707.707l-.736.737a.5.5 0 0 1-.707-.707zm-.684-2.651a.5.5 0 0 1 0 1H1.25a.5.5 0 0 1 0-1zM2.24 2.24a.5.5 0 0 1 .706 0l.737.736a.5.5 0 0 1-.707.707l-.737-.737a.5.5 0 0 1 0-.707m3.094.053V1.25a.5.5 0 0 1 1 0v1.042a.5.5 0 0 1-1 0M8.72 2.24a.5.5 0 0 1 .708.706l-.736.736a.5.5 0 0 1-.708-.707zM8.667 15v-3.333a.5.5 0 0 1 1 0V15c0 .641.526 1.167 1.166 1.167S12 15.641 12 15v-3.333a.5.5 0 0 1 1 0V15a2.17 2.17 0 0 1-2.167 2.167A2.17 2.17 0 0 1 8.667 15m8.358-3.49a.5.5 0 0 1 .95.316l-1.667 5a.5.5 0 0 1-.95 0l-1.666-5a.5.5 0 0 1 .95-.317l1.191 3.575z" />
  </svg>

  <!-- Wind -->
  <svg v-else-if="name === 'wind'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" aria-hidden="true">
    <path fill="currentColor" d="M9 9a3 3 0 1 1-2.585 4.523a1 1 0 0 1 1.724-1.015A1 1 0 1 0 9 11H2a1 1 0 1 1 0-2zm1.64-7.893a3.5 3.5 0 0 1 4.333 2.96A3.5 3.5 0 0 1 11.5 8H2a1 1 0 0 1 0-2h9.5a1.5 1.5 0 1 0-1.473-1.787a1 1 0 0 1-1.963-.384a3.5 3.5 0 0 1 2.577-2.722" />
  </svg>

  <!-- Location pin -->
  <svg v-else-if="name === 'location-pin'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8" />
    </g>
  </svg>

  <!-- Save location button -->
  <svg v-else-if="name === 'save-location'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" aria-hidden="true">
    <path fill="currentColor" d="M10.5 6.5a.5.5 0 0 1 1 0v2h2a.5.5 0 1 1 0 1h-2v2a.5.5 0 1 1-1 0v-2h-2a.5.5 0 1 1 0-1h2zm5-4.5A2.5 2.5 0 0 1 18 4.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 4 13.5v-9A2.5 2.5 0 0 1 6.5 2zM17 4.5A1.5 1.5 0 0 0 15.5 3h-9A1.5 1.5 0 0 0 5 4.5v9A1.5 1.5 0 0 0 6.5 15h9a1.5 1.5 0 0 0 1.5-1.5zM12.5 18c.954 0 1.818-.381 2.45-1H5.5A2.5 2.5 0 0 1 3 14.5V5.05c-.619.632-1 1.496-1 2.45v7A3.5 3.5 0 0 0 5.5 18z" />
  </svg>

  <!-- Remove from saved -->
  <svg v-else-if="name === 'remove-location'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 2048 2048" aria-hidden="true">
    <path fill="currentColor" d="M1792 384h-128v1472q0 40-15 75t-41 61t-61 41t-75 15H448q-40 0-75-15t-61-41t-41-61t-15-75V384H128V256h512V128q0-27 10-50t27-40t41-28t50-10h384q27 0 50 10t40 27t28 41t10 50v128h512zM768 256h384V128H768zm768 128H384v1472q0 26 19 45t45 19h1024q26 0 45-19t19-45zM768 1664H640V640h128zm256 0H896V640h128zm256 0h-128V640h128z" />
  </svg>

  <!-- Search -->
  <svg v-else-if="name === 'search'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21l-4.486-4.494M19 10.5a8.5 8.5 0 1 1-17 0a8.5 8.5 0 0 1 17 0Z" />
  </svg>
</template>
