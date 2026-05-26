<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChevronRight, Info, Search, ShoppingBag, Star, X } from 'lucide-vue-next'
import MenuCard from '@/components/MenuCard.vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

type Cuisine = 'Asia Foods' | 'Europe Foods'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  cuisine: Cuisine
  image_url: string
  imageSrc: string
  available: boolean
  menuItemId?: number
  badge?: string
  rating?: number | null
  ratingCount?: number
}

interface CategoryOption {
  key: string
  label: string
  folder: string
  description: string
}

const imageModules = import.meta.glob('../assets/pictures/**/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const cartStore = useCartStore()
const authStore = useAuthStore()
const activeCuisine = ref<Cuisine>('Asia Foods')
const activeCategory = ref('foods')
const searchQuery = ref('')
const selectedItem = ref<MenuItem | null>(null)
const selectedRating = ref(0)
const ratingComment = ref('')
const ratingMessage = ref('')
const isRatingSaving = ref(false)
const ratingSummaries = ref<Record<string, { menuItemId: number; averageRating: number | null; ratingCount: number }>>({})

const cuisineOptions = [
  {
    name: 'Asia Foods' as Cuisine,
    categoryKey: 'foods',
    imageFolder: 'AsiaFoods/Foods',
    description: 'Cambodian and Asian-inspired plates with herbs, rice, seafood, fruit, and warm spices.',
  },
  {
    name: 'Europe Foods' as Cuisine,
    categoryKey: 'foods',
    imageFolder: 'EroupFoods/Foods',
    description: 'European comfort and fine-dining choices: pizza, burgers, desserts, wines, and garden plates.',
  },
]

const categoryOptions: Record<Cuisine, CategoryOption[]> = {
  'Asia Foods': [
    { key: 'foods', label: 'Foods', folder: 'AsiaFoods/Foods', description: 'Khmer classics, seafood, rice plates, and warm Asian spices.' },
    { key: 'drinks', label: 'Drinks', folder: 'AsiaFoods/Drinks', description: 'Tea, citrus coolers, coffee, and dinner-friendly house pours.' },
    { key: 'desserts', label: 'Desserts', folder: 'AsiaFoods/Desert', description: 'Coconut, palm sugar, fruit, and soft pastry finishes.' },
    { key: 'fruites', label: 'Fruites', folder: 'AsiaFoods/Fruites', description: 'Seasonal tropical fruit plates and bright market bowls.' },
    { key: 'vegetarian', label: 'Vegetarian', folder: 'AsiaFoods/Vegeterain', description: 'Herb-forward garden plates with Asian sauces and grains.' },
    { key: 'wines', label: 'Wines', folder: 'AsiaFoods/Wines', description: 'Pairing bottles and cellar selections for Asian tasting menus.' },
  ],
  'Europe Foods': [
    { key: 'foods', label: 'Foods', folder: 'EroupFoods/Foods', description: 'Roasted meats and refined European comfort plates.' },
    { key: 'pizza', label: 'Pizza', folder: 'EroupFoods/Pizza', description: 'Stone-baked pizzas with cheese, herbs, char, and rich sauces.' },
    { key: 'burgers', label: 'Burgers', folder: 'EroupFoods/Burgers', description: 'Stacked burgers with brioche, cheese, pepper relish, and crisp greens.' },
    { key: 'pasta', label: 'Pasta', folder: 'EroupFoods/Pasta', description: 'Creamy, spicy, and black-gold pasta plates with seafood accents.' },
    { key: 'drinks', label: 'Drinks', folder: 'EroupFoods/Drinks', description: 'Cocktails, cold drinks, and European-style dinner refreshers.' },
    { key: 'desserts', label: 'Desserts', folder: 'EroupFoods/Sweets', description: 'French-style cakes, cream, berries, and patisserie textures.' },
    { key: 'wines', label: 'Wines', folder: 'EroupFoods/Wines', description: 'Red, white, sparkling, and pairing bottles for slow evenings.' },
    { key: 'garden', label: 'Garden', folder: 'EroupFoods/Vegeterain', description: 'European vegetable compositions, greens, and delicate sauces.' },
  ],
}

const dishCopy: Record<Cuisine, Record<string, Array<Omit<MenuItem, 'id' | 'cuisine' | 'category' | 'image_url' | 'imageSrc' | 'available'>>>> = {
  'Asia Foods': {
    foods: [
      { name: 'Signature Amok', description: 'Slow-steamed river fish in kaffir-lime lemongrass curry, coconut cream, turmeric, and holy basil.', price: 24, badge: 'Spicy', rating: 4.9 },
      { name: 'Mekong Ribeye', description: 'Charred beef finished with Kampot pepper crust, tamarind glaze, roasted garlic, and jasmine rice.', price: 42, badge: 'New', rating: 5.0 },
      { name: 'Lime Carpaccio', description: 'Beef cured in wild lime juice with mint, red onion, toasted peanuts, and green chili oil.', price: 18, rating: 4.8 },
    ],
    drinks: [
      { name: 'Palm Citrus Cooler', description: 'Palm sugar syrup, lime, mint, soda, and a gentle ginger finish for tropical evenings.', price: 8, badge: 'Fresh', rating: 4.8 },
      { name: 'Kampot Cold Brew', description: 'Dark coffee, coconut foam, burnt caramel, and a pinch of Kampot salt.', price: 7, rating: 4.7 },
      { name: 'Jasmine Lychee Tea', description: 'Cold jasmine tea with lychee, basil seed, and a clean floral aroma.', price: 6, rating: 4.9 },
    ],
    desserts: [
      { name: 'Palm Sugar Flan', description: 'Silky custard with palm caramel, toasted coconut, and kaffir lime zest.', price: 12, badge: 'Sweet', rating: 4.8 },
      { name: 'Coconut Rose Cake', description: 'Soft coconut sponge, rose cream, dark glaze, and seasonal berry notes.', price: 14, rating: 4.7 },
      { name: 'Sesame Honey Tart', description: 'Black sesame cream, honey crisp, coconut gelato, and roasted peanut crumble.', price: 13, rating: 4.8 },
    ],
    fruites: [
      { name: 'Tropical Market Bowl', description: 'Dragon fruit, mango, rambutan, citrus syrup, and crushed ice herbs.', price: 10, rating: 4.7 },
      { name: 'Mango Chili Plate', description: 'Green and ripe mango with salt chili, palm sugar, lime, and mint.', price: 9, badge: 'Bright', rating: 4.8 },
      { name: 'Lychee Berry Bloom', description: 'Lychee, strawberry, basil, orange blossom, and chilled coconut nectar.', price: 11, rating: 4.6 },
    ],
    vegetarian: [
      { name: 'Lotus Garden Curry', description: 'Lotus root, greens, eggplant, coconut broth, lemongrass, and jasmine rice.', price: 17, rating: 4.8 },
      { name: 'Charred Herb Greens', description: 'Seasonal vegetables with tamarind glaze, fried garlic, and Thai basil.', price: 15, badge: 'Green', rating: 4.7 },
      { name: 'Tofu Pepper Claypot', description: 'Silken tofu, Kampot pepper sauce, mushrooms, scallion, and steamed rice.', price: 16, rating: 4.9 },
    ],
    wines: [
      { name: 'Mekong Pairing Rouge', description: 'A rounded red wine pairing for pepper beef, grilled fish, and slow spice.', price: 38, badge: 'Pairing', rating: 4.7 },
      { name: 'Jasmine Blanc', description: 'A bright white pour for coconut curries, seafood, citrus herbs, and rice plates.', price: 36, rating: 4.8 },
      { name: 'Golden Celebration Brut', description: 'Dry bubbles for private tables, desserts, and the first toast of the evening.', price: 42, rating: 4.9 },
    ],
  },
  'Europe Foods': {
    foods: [
      { name: 'Black Gold Linguine', description: 'Squid ink pasta tossed with scallops, chili, garlic, and a glossy white wine butter.', price: 32, badge: 'Spicy', rating: 4.8 },
      { name: 'Truffle Obsidian', description: 'Fresh pasta with black truffle cream, parmesan snow, garlic, and Cambodian basil oil.', price: 29, badge: 'New', rating: 4.9 },
      { name: 'Fire Table Burger', description: 'Beef patty, aged cheddar, pepper relish, brioche, and crisp garden greens.', price: 22, rating: 4.7 },
    ],
    pizza: [
      { name: 'Margherita Royale', description: 'Tomato, mozzarella, basil oil, parmesan, and a crisp stone-baked crust.', price: 20, rating: 4.7 },
      { name: 'Pepper Char Pizza', description: 'Smoked beef, Kampot pepper, roasted onion, chili honey, and mozzarella.', price: 24, badge: 'Hot', rating: 4.8 },
      { name: 'Forest Mushroom Pizza', description: 'Wild mushrooms, cream, herbs, garlic oil, and shaved parmesan.', price: 23, rating: 4.8 },
    ],
    burgers: [
      { name: 'Fire Table Burger', description: 'Beef patty, aged cheddar, pepper relish, brioche, and crisp garden greens.', price: 22, rating: 4.7 },
      { name: 'Black Truffle Burger', description: 'Beef, truffle cream, caramelized onion, smoked cheese, and golden fries.', price: 27, badge: 'Chef', rating: 4.9 },
      { name: 'Crispy Garden Burger', description: 'Vegetable patty, basil aioli, tomato, pickles, and butter lettuce.', price: 19, rating: 4.6 },
    ],
    pasta: [
      { name: 'Golden Carbonara', description: 'Egg yolk cream, parmesan, pancetta, cracked pepper, and handmade pasta ribbons.', price: 25, rating: 4.8 },
      { name: 'Sea Scallop Nero', description: 'Black pasta, seared scallops, chili oil, lemon butter, and toasted breadcrumbs.', price: 34, badge: 'Chef', rating: 4.9 },
      { name: 'Tomato Basil Rigatoni', description: 'Slow tomato sauce, basil, olive oil, whipped ricotta, and parmesan.', price: 21, rating: 4.7 },
    ],
    desserts: [
      { name: 'Velvet Berry Finale', description: 'Berries, cream, soft pastry, vanilla, and a light French dessert finish.', price: 18, rating: 4.8 },
      { name: 'Chocolate Rose Dome', description: 'Dark chocolate mousse, rose gel, almond biscuit, and gold cocoa glaze.', price: 19, badge: 'New', rating: 4.9 },
      { name: 'Lemon Cloud Tart', description: 'Lemon curd, meringue, short crust, and fragrant citrus zest.', price: 16, rating: 4.7 },
    ],
    wines: [
      { name: 'Bordeaux Rouge', description: 'A structured red pairing for beef, duck, pepper sauce, and roasted dishes.', price: 45, rating: 4.8 },
      { name: 'Loire Blanc', description: 'Mineral white wine for fish, citrus herbs, prawns, and light garden plates.', price: 39, badge: 'Pairing', rating: 4.7 },
      { name: 'Sparkling Brut', description: 'Dry bubbles for celebrations, desserts, and the first pour of the evening.', price: 42, rating: 4.9 },
    ],
    drinks: [
      { name: 'Citrus Aperitivo', description: 'Bitter orange, soda, herbs, and a bright European dinner-hour finish.', price: 9, rating: 4.7 },
      { name: 'Velvet Espresso', description: 'Espresso, cream, dark caramel, and a cold glass service.', price: 8, badge: 'Cold', rating: 4.8 },
      { name: 'Garden Spritz', description: 'Sparkling citrus, basil, cucumber, and a clean aromatic lift.', price: 10, rating: 4.7 },
    ],
    garden: [
      { name: 'Emerald Prawns', description: 'Char-grilled prawns over seasonal greens, ginger soy dressing, and herb oil.', price: 26, rating: 4.7 },
      { name: 'Burrata Herb Plate', description: 'Burrata, roasted tomato, basil oil, olives, and crisp bread.', price: 24, rating: 4.8 },
      { name: 'Wild Mushroom Garden', description: 'Roasted mushrooms, greens, parmesan cream, and toasted seed crumble.', price: 20, badge: 'Garden', rating: 4.7 },
    ],
  },
}

const categoryNamePools: Record<Cuisine, Record<string, string[]>> = {
  'Asia Foods': {
    foods: ['Fish Amok', 'Beef Lok Lak', 'Khmer Curry', 'Grilled Pork', 'Pepper Beef', 'Lemongrass Chicken', 'Pork Rice', 'Mango Salad', 'Coconut Soup', 'Fried Noodles'],
    drinks: ['Jasmine Tea', 'Lychee Cooler', 'Palm Soda', 'Cold Brew', 'Ginger Lime', 'Iced Coffee', 'Mint Tea', 'Coconut Juice', 'Tamarind Fizz'],
    desserts: ['Palm Flan', 'Coconut Cake', 'Sesame Tart', 'Mango Sticky Rice', 'Banana Fritter', 'Rice Pudding', 'Coconut Jelly', 'Honey Cake', 'Sweet Dumpling'],
    fruites: ['Mango Bowl', 'Dragon Fruit', 'Lychee Plate', 'Papaya Lime', 'Berry Bloom', 'Citrus Plate', 'Tropical Bowl', 'Rambutan Cup', 'Melon Mix'],
    vegetarian: ['Lotus Curry', 'Tofu Claypot', 'Herb Greens', 'Mushroom Rice', 'Garden Noodles', 'Eggplant Curry', 'Green Salad', 'Vegetable Amok'],
    wines: ['Jasmine Blanc', 'Mekong Rouge', 'Golden Brut', 'Lotus Rose', 'Pepper Red', 'Coconut White'],
  },
  'Europe Foods': {
    foods: ['Roast Beef', 'Grilled Salmon', 'Herb Chicken', 'Truffle Pasta', 'Scallop Butter', 'Steak Frites', 'Duck Jus', 'Seafood Plate'],
    pizza: ['Margherita', 'Pepper Pizza', 'Mushroom Pizza', 'Cheese Pizza', 'Garden Pizza', 'Truffle Pizza', 'Spicy Pizza', 'Seafood Pizza'],
    burgers: ['Classic Burger', 'Double Burger', 'Cheese Burger', 'Truffle Burger', 'Crispy Burger', 'Spicy Burger', 'Garden Burger', 'Black Burger'],
    pasta: ['Carbonara', 'Nero Pasta', 'Basil Rigatoni', 'Seafood Pasta', 'Tomato Pasta', 'Creamy Pasta', 'Truffle Linguine', 'Garlic Spaghetti'],
    drinks: ['Aperitivo', 'Espresso', 'Garden Spritz', 'Berry Soda', 'Lemon Fizz', 'Iced Latte', 'Orange Tonic', 'Mint Cooler'],
    desserts: ['Berry Finale', 'Rose Dome', 'Lemon Tart', 'Chocolate Cake', 'Pancakes', 'Cupcake', 'Cream Cake', 'Fruit Tart'],
    wines: ['Bordeaux', 'Loire Blanc', 'Sparkling Brut', 'Chardonnay', 'Cabernet', 'Rose Wine', 'Pinot Noir'],
    garden: ['Burrata Plate', 'Mushroom Garden', 'Emerald Prawns', 'Harvest Salad', 'Avocado Toast', 'Quinoa Bowl', 'Roasted Greens'],
  },
}

const folderImages = (folder: string) =>
  Object.entries(imageModules)
    .filter(([path]) => path.includes(`/pictures/${folder}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => ({
      path: path.split('/pictures/')[1] || '',
      src,
    }))

const dishNameFor = (cuisine: Cuisine, categoryKey: string, index: number) => {
  const names = categoryNamePools[cuisine][categoryKey] || ['NekMak Plate']
  return names[index % names.length]
}

const imageFor = (folder: string, index: number) => {
  const images = folderImages(folder)
  return images[index % Math.max(images.length, 1)] || { path: '', src: '' }
}

const buildItems = (cuisine: Cuisine, category: CategoryOption): MenuItem[] => {
  const copy = dishCopy[cuisine][category.key] || []
  const images = folderImages(category.folder)
  const total = Math.max(images.length, copy.length)

  return Array.from({ length: total }, (_, index) => {
    const template = copy[index % Math.max(copy.length, 1)]
    const image = images[index] || imageFor(category.folder, index)
    const item = template || {
      name: dishNameFor(cuisine, category.key, index),
      description: category.description,
      price: cuisine === 'Asia Foods' ? 14 + (index % 6) * 3 : 18 + (index % 7) * 4,
    }

    return {
      ...item,
      name: index < copy.length ? item.name : dishNameFor(cuisine, category.key, index),
      id: (cuisine === 'Asia Foods' ? 10000 : 20000) + category.key.length * 100 + index,
      category: category.label,
      cuisine,
      image_url: image.path,
      imageSrc: image.src,
      available: true,
      menuItemId: ratingSummaries.value[item.name]?.menuItemId,
      rating: ratingSummaries.value[item.name]?.averageRating ?? null,
      ratingCount: ratingSummaries.value[item.name]?.ratingCount ?? 0,
    }
  })
}

const allItems = computed<MenuItem[]>(() =>
  (Object.keys(categoryOptions) as Cuisine[]).flatMap((cuisine) =>
    categoryOptions[cuisine].flatMap((category) => buildItems(cuisine, category))
  )
)

const selectedCuisine = computed(() => cuisineOptions.find((cuisine) => cuisine.name === activeCuisine.value) || cuisineOptions[0])
const currentCategories = computed(() => categoryOptions[activeCuisine.value])
const selectedCategory = computed(() => currentCategories.value.find((category) => category.key === activeCategory.value) || currentCategories.value[0])

const cuisineTiles = computed(() =>
  cuisineOptions.map((cuisine) => {
    const image = imageFor(cuisine.imageFolder, 0)
    const count = categoryOptions[cuisine.name].reduce((total, category) => total + buildItems(cuisine.name, category).length, 0)
    return { ...cuisine, count, imageSrc: image.src }
  })
)

const categoryTiles = computed(() =>
  currentCategories.value.map((category) => {
    const image = imageFor(category.folder, 0)
    return {
      ...category,
      imageSrc: image.src,
      total: buildItems(activeCuisine.value, category).length,
    }
  })
)

const displayedItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  let items = buildItems(activeCuisine.value, selectedCategory.value)

  if (query) {
    items = allItems.value.filter((item) =>
      item.cuisine === activeCuisine.value &&
      (item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query))
    )
  }

  return items
})

const selectCuisine = (cuisine: Cuisine) => {
  activeCuisine.value = cuisine
  activeCategory.value = categoryOptions[cuisine][0].key
  searchQuery.value = ''
}

const selectCategory = (category: string) => {
  activeCategory.value = category
  searchQuery.value = ''
}

const openDetail = (item: MenuItem) => {
  selectedItem.value = item
  selectedRating.value = 0
  ratingComment.value = ''
  ratingMessage.value = ''
}

const addDetailItem = () => {
  if (!selectedItem.value) return

  cartStore.addToCart({
    id: selectedItem.value.id,
    name: selectedItem.value.name,
    price: selectedItem.value.price,
    image_url: selectedItem.value.image_url,
    imageSrc: selectedItem.value.imageSrc,
    menuItemId: selectedItem.value.menuItemId,
  })
}

const refreshRatingSummaries = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/reviews/summary')
    if (!response.ok) return

    const rows: Array<{ name: string; menu_item_id: number; average_rating: string | number | null; rating_count: number }> = await response.json()
    ratingSummaries.value = rows.reduce<Record<string, { menuItemId: number; averageRating: number | null; ratingCount: number }>>((summary, row) => {
      summary[row.name] = {
        menuItemId: row.menu_item_id,
        averageRating: row.average_rating === null ? null : Number(row.average_rating),
        ratingCount: Number(row.rating_count || 0),
      }
      return summary
    }, {})
  } catch (error) {
    console.error('Unable to load rating summaries', error)
  }
}

const submitRating = async () => {
  if (!selectedItem.value || selectedRating.value === 0) return

  if (!authStore.token) {
    ratingMessage.value = 'Please login before rating this dish.'
    return
  }

  isRatingSaving.value = true
  ratingMessage.value = ''

  try {
    const ensureResponse = await fetch('http://localhost:5001/api/menu-items/ensure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        name: selectedItem.value.name,
        description: selectedItem.value.description,
        price: selectedItem.value.price,
        category: selectedItem.value.category,
        cuisine: selectedItem.value.cuisine,
        imageUrl: selectedItem.value.image_url,
      }),
    })

    if (!ensureResponse.ok) throw new Error('Unable to prepare menu item for rating')
    const ensured = await ensureResponse.json()

    const ratingResponse = await fetch('http://localhost:5001/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        menuItemId: ensured.id,
        rating: selectedRating.value,
        comment: ratingComment.value,
        isFavorite: false,
      }),
    })

    if (!ratingResponse.ok) throw new Error('Unable to save rating')
    ratingMessage.value = 'Thanks. Your rating was saved.'
    await refreshRatingSummaries()
    const fresh = ratingSummaries.value[selectedItem.value.name]
    selectedItem.value = {
      ...selectedItem.value,
      menuItemId: fresh?.menuItemId,
      rating: fresh?.averageRating ?? null,
      ratingCount: fresh?.ratingCount ?? 0,
    }
  } catch (error) {
    console.error(error)
    ratingMessage.value = 'Could not save rating. Please try again.'
  } finally {
    isRatingSaving.value = false
  }
}

onMounted(refreshRatingSummaries)
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white">
    <section class="relative flex min-h-[58vh] items-center justify-center overflow-hidden pt-24">
      <img
        src="@/assets/pictures/AsiaFoods/Foods/sharonang-fish-amok-921926_1920.jpg"
        alt="NekMak signature menu"
        class="absolute inset-0 h-full w-full scale-105 object-cover opacity-50"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-base-dark/90 via-base-dark/55 to-base-dark"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-base-dark via-transparent to-base-dark/60"></div>

      <div class="relative z-10 max-w-4xl px-6 text-center">
        <div class="mb-4 flex items-center justify-center gap-4">
          <div class="h-px w-12 bg-gold/50"></div>
          <span class="text-xs font-bold uppercase tracking-[0.5em] text-gold">NekMak Gastronomy</span>
          <div class="h-px w-12 bg-gold/50"></div>
        </div>
        <h1 class="font-serif text-6xl leading-none tracking-tight text-white md:text-8xl">The Menu</h1>
        <p class="mx-auto mt-7 max-w-2xl font-serif text-lg italic leading-relaxed text-text-subtle md:text-xl">
          Select Asia Foods or Europe Foods, choose a category, then browse the local dishes saved in that folder.
        </p>

        <button
          @click="selectCuisine('Asia Foods')"
          class="group mx-auto mt-9 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gold transition-colors hover:text-white"
        >
          Explore Asia Foods
          <ChevronRight class="h-4 w-4 transition-transform group-hover:translate-x-2" />
        </button>
      </div>
    </section>

    <section class="border-y border-gold/10 bg-base-dark/95 backdrop-blur-md">
      <div class="container mx-auto space-y-8 px-6 py-10 lg:px-16">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <button
            v-for="cuisine in cuisineTiles"
            :key="cuisine.name"
            @click="selectCuisine(cuisine.name)"
            :class="[
              'group relative min-h-64 overflow-hidden border text-left transition-all duration-500',
              activeCuisine === cuisine.name ? 'border-gold shadow-2xl shadow-gold/10' : 'border-gold/10 hover:border-gold/45'
            ]"
          >
            <img :src="cuisine.imageSrc" :alt="cuisine.name" class="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-r from-base-dark via-base-dark/78 to-base-dark/30"></div>
            <div class="relative z-10 max-w-3xl p-8 md:p-10">
              <p class="text-[10px] font-black uppercase tracking-[0.38em] text-gold">{{ cuisine.count }} items</p>
              <h2 class="mt-4 font-serif text-5xl text-white">{{ cuisine.name }}</h2>
              <p class="mt-5 max-w-xl text-lg leading-8 text-white/66">{{ cuisine.description }}</p>
            </div>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <button
            v-for="tile in categoryTiles"
            :key="tile.key"
            @click="selectCategory(tile.key)"
            :class="[
              'group relative h-28 overflow-hidden border text-left transition-all duration-500',
              activeCategory === tile.key ? 'border-gold shadow-xl shadow-gold/10' : 'border-gold/10 hover:border-gold/45'
            ]"
          >
            <img :src="tile.imageSrc" :alt="tile.label" class="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-base-dark/58"></div>
            <span class="relative z-10 block px-5 pt-6 text-[10px] font-black uppercase tracking-[0.26em] text-gold">{{ tile.label }}</span>
            <span class="relative z-10 block px-5 pt-1 text-sm text-white/72">{{ tile.total }} plates</span>
          </button>
        </div>

        <div class="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div class="flex flex-wrap justify-center gap-3">
            <button
              v-for="cat in currentCategories"
              :key="cat.key"
              @click="selectCategory(cat.key)"
              :class="[
                'px-7 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-500',
                activeCategory === cat.key ? 'rounded-full bg-gold text-base-dark shadow-xl shadow-gold/20' : 'text-text-muted hover:text-gold'
              ]"
            >
              {{ cat.label }}
            </button>
          </div>

          <div class="group relative w-full md:w-96">
            <Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold/35 transition-colors group-focus-within:text-gold" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search the menu..."
              class="w-full border-b border-gold/20 bg-transparent py-3 pl-12 pr-4 text-base italic text-white transition-all placeholder:text-text-muted focus:border-gold focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 py-20 lg:px-16">
      <div class="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">{{ selectedCuisine.name }}</p>
          <h2 class="mt-3 font-serif text-4xl md:text-6xl">{{ searchQuery ? 'Search Results' : selectedCategory.label }}</h2>
          <p class="mt-4 max-w-2xl text-sm leading-7 text-white/58">{{ selectedCategory.description }}</p>
        </div>
        <p class="text-sm uppercase tracking-[0.25em] text-text-muted">Showing {{ displayedItems.length }} cards</p>
      </div>

      <div v-if="displayedItems.length > 0" class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        <MenuCard
          v-for="item in displayedItems"
          :key="item.id"
          :item="item"
          @show-detail="openDetail(item)"
        />
      </div>

      <div v-else class="space-y-8 py-32 text-center">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-gold/20">
          <Info class="h-8 w-8 text-gold/25" />
        </div>
        <div class="space-y-4">
          <p class="font-serif text-4xl text-white">No Matching Dishes</p>
          <p class="mx-auto max-w-md italic text-text-muted">Try another category or clear your search.</p>
          <button @click="searchQuery = ''" class="text-xs font-bold uppercase tracking-widest text-gold hover:underline">Clear Search</button>
        </div>
      </div>
    </section>

    <Transition name="fade">
      <div v-if="selectedItem" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" @click.self="selectedItem = null">
        <div class="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-gold/20 bg-base-dark">
          <button @click="selectedItem = null" class="float-right m-4 p-2 text-gold hover:text-white" aria-label="Close dish detail">
            <X class="h-6 w-6" />
          </button>
          <div class="grid grid-cols-1 md:grid-cols-2">
            <img :src="selectedItem.imageSrc" :alt="selectedItem.name" class="h-full min-h-[360px] w-full object-cover" />
            <div class="space-y-6 p-8 md:p-10">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gold">{{ selectedItem.cuisine }} / {{ selectedItem.category }}</p>
              <h3 class="font-serif text-4xl text-white md:text-5xl">{{ selectedItem.name }}</h3>
              <div class="flex items-center gap-2" :class="selectedItem.rating && selectedItem.ratingCount ? 'text-gold' : 'text-text-muted'">
                <Star class="h-5 w-5" :class="selectedItem.rating && selectedItem.ratingCount ? 'fill-current' : ''" />
                <span class="text-sm">
                  {{ selectedItem.rating && selectedItem.ratingCount ? `${selectedItem.rating.toFixed(1)} (${selectedItem.ratingCount} ratings)` : 'No ratings yet' }}
                </span>
              </div>
              <p class="leading-relaxed text-text-subtle">{{ selectedItem.description }}</p>
              <div class="font-serif text-4xl text-gold">${{ selectedItem.price.toFixed(2) }}</div>

              <button
                @click="addDetailItem"
                class="w-full bg-gold py-4 text-xs font-black uppercase tracking-[0.3em] text-base-dark transition-colors hover:bg-white"
              >
                Add To Cart
              </button>

              <div class="space-y-4 border-t border-gold/10 pt-6">
                <p class="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Rate this dish</p>
                <div class="flex gap-2">
                  <button
                    v-for="star in 5"
                    :key="star"
                    @click="selectedRating = star"
                    class="text-gold transition-transform hover:scale-110"
                    :aria-label="`Rate ${star} stars`"
                  >
                    <Star class="h-7 w-7" :class="star <= selectedRating ? 'fill-current' : ''" />
                  </button>
                </div>
                <textarea
                  v-model="ratingComment"
                  rows="3"
                  placeholder="Optional note"
                  class="w-full border border-gold/10 bg-base-dark/70 px-4 py-3 text-sm text-white outline-none placeholder:text-text-muted focus:border-gold"
                ></textarea>
                <button
                  @click="submitRating"
                  :disabled="selectedRating === 0 || isRatingSaving"
                  class="w-full border border-gold/40 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold hover:text-base-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {{ isRatingSaving ? 'Saving...' : 'Save Rating' }}
                </button>
                <p v-if="ratingMessage" class="text-xs text-text-subtle">{{ ratingMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="fixed bottom-8 right-8 z-[90] flex flex-col gap-4">
      <button
        @click="cartStore.toggleCart()"
        class="group relative rounded-full bg-gold p-5 text-base-dark shadow-2xl transition-transform hover:scale-110 active:scale-95"
        aria-label="Open saved cart"
      >
        <ShoppingBag class="h-6 w-6" />
        <span v-if="cartStore.totalItems > 0" class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gold bg-white text-[10px] font-black text-base-dark shadow-lg">
          {{ cartStore.totalItems }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
