<script setup lang="ts">
const images = [
  {
    src: 'https://images.pexels.com/photos/15750725/pexels-photo-15750725.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Cozy seating in a dimly lit elegant restaurant interior - Photo by Ayberk Mirza',
  },
  {
    src: 'https://images.pexels.com/photos/27851192/pexels-photo-27851192.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Luxurious crystal decanter and cocktail glass on wooden table - Photo by Marcelo Verfe',
  },
]
</script>

<template>
  <section class="mt-24 px-6 lg:px-16">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="overflow-hidden rounded-sm group"
      >
        <img
          :src="image.src"
          :alt="image.alt"
          class="w-full h-64 md:h-80 object-cover grayscale hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>
