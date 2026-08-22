// Mock baseline data for GlobalTrotter travel app

export const DEFAULT_DESTINATIONS = [
  {
    id: "dest-paris",
    name: "Paris",
    country: "France",
    region: "Europe",
    cost_index: 4.8,
    popularity: 4.8,
    coordinates_lat: 48.8566,
    coordinates_lng: 2.3522,
    image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "dest-santorini",
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    cost_index: 4.5,
    popularity: 4.7,
    coordinates_lat: 36.4076,
    coordinates_lng: 25.4324,
    image_url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "dest-tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    cost_index: 4.2,
    popularity: 4.9,
    coordinates_lat: 35.6762,
    coordinates_lng: 139.6503,
    image_url: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "dest-bali",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    cost_index: 2.5,
    popularity: 4.6,
    coordinates_lat: -8.4095,
    coordinates_lng: 115.1889,
    image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "dest-rome",
    name: "Rome",
    country: "Italy",
    region: "Europe",
    cost_index: 4.0,
    popularity: 4.8,
    coordinates_lat: 41.9028,
    coordinates_lng: 12.4964,
    image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "dest-barcelona",
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    cost_index: 3.8,
    popularity: 4.7,
    coordinates_lat: 41.3851,
    coordinates_lng: 2.1734,
    image_url: "https://images.unsplash.com/photo-1583422409516-2895a77efedd?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "dest-lisbon",
    name: "Lisbon",
    country: "Portugal",
    region: "Europe",
    cost_index: 3.2,
    popularity: 4.6,
    coordinates_lat: 38.7223,
    coordinates_lng: -9.1393,
    image_url: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "dest-dubai",
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    cost_index: 4.9,
    popularity: 4.5,
    coordinates_lat: 25.2048,
    coordinates_lng: 55.2708,
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80"
  }
];

export const DEFAULT_ACTIVITIES = [
  {
    id: "act-paris-1",
    destination_id: "dest-paris",
    name: "Eiffel Tower Guided Summit Tour",
    description: "Skip the line and explore the top levels of the Eiffel Tower with a local historian.",
    duration_mins: 120,
    cost: 3200,
    rating: 4.9,
    category: "Culture",
    image_url: "https://images.unsplash.com/photo-1543349689-9a4d426bee87?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-paris-2",
    destination_id: "dest-paris",
    name: "Louvre Museum Audio Tour",
    description: "Marvel at the Mona Lisa and ancient Greek sculptures inside the world's largest art museum.",
    duration_mins: 180,
    cost: 2000,
    rating: 4.8,
    category: "Culture",
    image_url: "https://images.unsplash.com/photo-1601887389937-0b02c26b6c3c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-paris-3",
    destination_id: "dest-paris",
    name: "Seine River Dinner Cruise",
    description: "Enjoy a luxury 3-course French dining experience while drifting past lit-up monuments.",
    duration_mins: 150,
    cost: 7500,
    rating: 4.7,
    category: "Food",
    image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-paris-4",
    destination_id: "dest-paris",
    name: "Fresh Croissant Pastry Workshop",
    description: "Learn the secrets of making buttery croissants from an artisanal Parisian chef.",
    duration_mins: 90,
    cost: 3800,
    rating: 4.9,
    category: "Food",
    image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-rome-1",
    destination_id: "dest-rome",
    name: "Colosseum & Roman Forum Tour",
    description: "Walk in the footsteps of gladiators on a comprehensive ancient Rome archaeological tour.",
    duration_mins: 180,
    cost: 4000,
    rating: 4.9,
    category: "Culture",
    image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-rome-2",
    destination_id: "dest-rome",
    name: "Vatican Museum & Sistine Chapel",
    description: "Skip the massive lines to witness Michelangelo's ceiling frescoes and historical tapestries.",
    duration_mins: 240,
    cost: 4500,
    rating: 4.8,
    category: "Culture",
    image_url: "https://images.unsplash.com/photo-1529260830199-44552e0221c4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-rome-3",
    destination_id: "dest-rome",
    name: "Trastevere Food Tasting Walk",
    description: "Explore Rome's coolest neighborhood while sampling pasta, suppli, gelato and wines.",
    duration_mins: 150,
    cost: 5000,
    rating: 4.9,
    category: "Food",
    image_url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-tokyo-1",
    destination_id: "dest-tokyo",
    name: "Tsukiji Outer Market Sushi Tour",
    description: "Learn how to select fresh sashimi and eat at authentic hidden stalls with a guide.",
    duration_mins: 120,
    cost: 5500,
    rating: 4.9,
    category: "Food",
    image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-tokyo-2",
    destination_id: "dest-tokyo",
    name: "Shinjuku Golden Gai Izakaya Tour",
    description: "Navigate the narrow alleys of Golden Gai and drink sake alongside Tokyo locals.",
    duration_mins: 180,
    cost: 6500,
    rating: 4.7,
    category: "Nightlife",
    image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-tokyo-3",
    destination_id: "dest-tokyo",
    name: "TeamLab Planets Digital Art",
    description: "Walk through massive water and light installations in this immersive futuristic museum.",
    duration_mins: 90,
    cost: 2500,
    rating: 4.9,
    category: "Culture",
    image_url: "https://images.unsplash.com/photo-1576016770956-debb63d900ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-bali-1",
    destination_id: "dest-bali",
    name: "Ubud Sacred Monkey Forest Sanctuary",
    description: "Walk inside a lush jungle reserve inhabited by hundreds of mischievous long-tailed macaques.",
    duration_mins: 120,
    cost: 800,
    rating: 4.6,
    category: "Nature",
    image_url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ca6?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-bali-2",
    destination_id: "dest-bali",
    name: "Mount Batur Sunrise Volcano Trek",
    description: "Wake up early for a guided night hike to the summit of an active volcano for sunrise.",
    duration_mins: 300,
    cost: 4500,
    rating: 4.8,
    category: "Adventure",
    image_url: "https://images.unsplash.com/photo-1505993597083-3bd19f7c3f3d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "act-bali-3",
    destination_id: "dest-bali",
    name: "Uluwatu Sunset Temple Kecak Dance",
    description: "Watch a traditional fire dance performance on a cliff overlooking the Indian Ocean.",
    duration_mins: 150,
    cost: 1500,
    rating: 4.7,
    category: "Culture",
    image_url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80"
  }
];

export const MOCK_PROFILE = {
  id: "profile-alex-johnson",
  full_name: "Alex Johnson",
  avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
  country: "India",
  bio: "Curator of slow itineraries. Seeking cinematic angles, late-night vinyl bars, and authentic culinary secrets around the globe.",
  is_admin: true,
  cities_visited: 12,
  countries_visited: 7,
  days_traveled: 38,
  total_spent: 245000
};

export const MOCK_TRIPS = [
  {
    id: "trip-european-explorer",
    user_id: "profile-alex-johnson",
    name: "European Explorer",
    description: "Chasing sunsets and history through Paris, Rome, Barcelona, and Lisbon.",
    cover_image: "https://images.unsplash.com/photo-1486299267070-8382e05431dd?auto=format&fit=crop&w=1200&q=80",
    start_date: "2026-05-20",
    end_date: "2026-05-30",
    budget: 145000,
    currency: "INR",
    travel_preferences: { pace: "relaxed", style: "art & architecture" },
    is_public: true,
    cities: ["Paris", "Rome", "Barcelona", "Lisbon"],
    duration_days: 10
  },
  {
    id: "trip-japan-spring",
    user_id: "profile-alex-johnson",
    name: "Japan Spring Adventure",
    description: "Sakura blossoms, neon nights in Shinjuku, and traditional ryokans in Kyoto.",
    cover_image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
    start_date: "2026-03-15",
    end_date: "2026-03-25",
    budget: 210000,
    currency: "INR",
    travel_preferences: { pace: "moderate", style: "nature & culinary" },
    is_public: false,
    cities: ["Tokyo", "Kyoto", "Osaka"],
    duration_days: 10
  },
  {
    id: "trip-bali-relax",
    user_id: "profile-alex-johnson",
    name: "Bali Relaxation",
    description: "Wellness retreats, surfing in Canggu, and volcano trekking at Mount Batur.",
    cover_image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
    start_date: "2026-04-05",
    end_date: "2026-04-12",
    budget: 85000,
    currency: "INR",
    travel_preferences: { pace: "slow", style: "wellness & beaches" },
    is_public: false,
    cities: ["Ubud", "Canggu"],
    duration_days: 8
  },
  {
    id: "trip-nyc-break",
    user_id: "profile-alex-johnson",
    name: "New York City Break",
    description: "Broadway shows, galleries, Chelsea Market walks, and Central Park cycling.",
    cover_image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80",
    start_date: "2026-06-01",
    end_date: "2026-06-07",
    budget: 180000,
    currency: "INR",
    travel_preferences: { pace: "fast", style: "metropolitan & shows" },
    is_public: false,
    cities: ["New York"],
    duration_days: 7
  }
];

export const MOCK_STOPS = [
  { id: "stop-ee-1", trip_id: "trip-european-explorer", destination_id: "dest-paris", stop_order: 1 },
  { id: "stop-ee-2", trip_id: "trip-european-explorer", destination_id: "dest-rome", stop_order: 2 },
  { id: "stop-ee-3", trip_id: "trip-european-explorer", destination_id: "dest-barcelona", stop_order: 3 },
  { id: "stop-ee-4", trip_id: "trip-european-explorer", destination_id: "dest-lisbon", stop_order: 4 }
];

export const MOCK_ITINERARY = [
  // Day 1 (Paris)
  { id: "iti-ee-1", trip_id: "trip-european-explorer", day_number: 1, start_time: "09:00", activity_name: "Breakfast at Angelina", duration_mins: 60, cost: 1350, order_index: 0 },
  { id: "iti-ee-2", trip_id: "trip-european-explorer", day_number: 1, start_time: "10:30", activity_name: "Eiffel Tower Guided Summit", duration_mins: 120, cost: 3150, order_index: 1 },
  { id: "iti-ee-3", trip_id: "trip-european-explorer", day_number: 1, start_time: "13:00", activity_name: "Lunch at Le Relais de l'Entrecôte", duration_mins: 90, cost: 2250, order_index: 2 },
  { id: "iti-ee-4", trip_id: "trip-european-explorer", day_number: 1, start_time: "15:30", activity_name: "Louvre Museum Audio Tour", duration_mins: 180, cost: 1980, order_index: 3 },
  // Day 2 (Paris)
  { id: "iti-ee-5", trip_id: "trip-european-explorer", day_number: 2, start_time: "10:00", activity_name: "Montmartre & Sacré-Cœur Walk", duration_mins: 120, cost: 0, order_index: 0 },
  { id: "iti-ee-6", trip_id: "trip-european-explorer", day_number: 2, start_time: "14:00", activity_name: "Croissant Workshop", duration_mins: 90, cost: 3800, order_index: 1 },
  // Day 3 (Rome)
  { id: "iti-ee-7", trip_id: "trip-european-explorer", day_number: 3, start_time: "09:00", activity_name: "Colosseum & Roman Forum Tour", duration_mins: 180, cost: 4000, order_index: 0 },
  { id: "iti-ee-8", trip_id: "trip-european-explorer", day_number: 3, start_time: "14:30", activity_name: "Trevi Fountain & Spanish Steps", duration_mins: 90, cost: 0, order_index: 1 },
  // Day 4 (Rome) - Budget Warn Test
  { id: "iti-ee-9", trip_id: "trip-european-explorer", day_number: 4, start_time: "09:00", activity_name: "Vatican Museum & Sistine Chapel", duration_mins: 240, cost: 4500, order_index: 0 },
  { id: "iti-ee-10", trip_id: "trip-european-explorer", day_number: 4, start_time: "15:00", activity_name: "Exclusive Private Gallery Tour", duration_mins: 120, cost: 14000, order_index: 1 }, // Generates Day 4 budget over
  { id: "iti-ee-11", trip_id: "trip-european-explorer", day_number: 4, start_time: "19:00", activity_name: "Trastevere Luxury Food Tasting", duration_mins: 150, cost: 5000, order_index: 2 }
];

export const MOCK_EXPENSES = [
  // European Explorer Expenses
  { id: "exp-ee-1", trip_id: "trip-european-explorer", category: "Transport", amount: 45000, description: "Flights (IND -> PAR, LIS -> IND)", date: "2026-05-18" },
  { id: "exp-ee-2", trip_id: "trip-european-explorer", category: "Stay", amount: 35000, description: "Boutique stays in Paris & Rome", date: "2026-05-20" },
  { id: "exp-ee-3", trip_id: "trip-european-explorer", category: "Activities", amount: 30000, description: "Museum passes and guide fees", date: "2026-05-22" },
  { id: "exp-ee-4", trip_id: "trip-european-explorer", category: "Food", amount: 20000, description: "Dinners & cafe logs", date: "2026-05-23" },
  { id: "exp-ee-5", trip_id: "trip-european-explorer", category: "Other", amount: 15000, description: "Gifts & local subway travel", date: "2026-05-24" }
];

export const MOCK_COMMUNITY_TRIPS = [
  {
    id: "pub-1",
    author: "Elena Rostova",
    author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80",
    name: "European Explorer",
    cover_image: "https://images.unsplash.com/photo-1486299267070-8382e05431dd?auto=format&fit=crop&w=800&q=80",
    cities: ["Paris", "Rome", "Barcelona", "Lisbon"],
    dates: "May 20 — May 30, 2026",
    duration: 10,
    budget: 145000,
    currency: "INR",
    likes: 124,
    stops: [
      { name: "Paris", days: 3 },
      { name: "Rome", days: 3 },
      { name: "Barcelona", days: 2 },
      { name: "Lisbon", days: 2 }
    ]
  },
  {
    id: "pub-2",
    author: "Kenji Sato",
    author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80",
    name: "Japan Through My Eyes",
    cover_image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    cities: ["Tokyo", "Kyoto", "Hakone", "Osaka"],
    dates: "Apr 10 — Apr 22, 2026",
    duration: 12,
    budget: 250000,
    currency: "INR",
    likes: 312,
    stops: [
      { name: "Tokyo", days: 4 },
      { name: "Kyoto", days: 4 },
      { name: "Hakone", days: 2 },
      { name: "Osaka", days: 2 }
    ]
  },
  {
    id: "pub-3",
    author: "Zarah Vance",
    author_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80",
    name: "Bali Slow Travel",
    cover_image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    cities: ["Ubud", "Canggu", "Nusa Penida"],
    dates: "Jul 1 — Jul 14, 2026",
    duration: 14,
    budget: 110000,
    currency: "INR",
    likes: 89,
    stops: [
      { name: "Ubud", days: 6 },
      { name: "Canggu", days: 4 },
      { name: "Nusa Penida", days: 4 }
    ]
  },
  {
    id: "pub-4",
    author: "Alex Johnson",
    author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80",
    name: "48 Hours in Tokyo",
    cover_image: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80",
    cities: ["Tokyo"],
    dates: "Aug 12 — Aug 14, 2026",
    duration: 2,
    budget: 45000,
    currency: "INR",
    likes: 56,
    stops: [
      { name: "Tokyo", days: 2 }
    ]
  }
];

export const MOCK_TIMELINE = [
  { id: "timeline-1", text: "You created a new trip", tripName: "European Explorer", color: "#C94F82", time: "2 hours ago" },
  { id: "timeline-2", text: "Added Rome to your itinerary", tripName: "European Explorer", color: "#48B7B0", time: "1 day ago" },
  { id: "timeline-3", text: "Added Colosseum Tour to Day 3", tripName: "European Explorer", color: "#E6B83D", time: "2 days ago" }
];
