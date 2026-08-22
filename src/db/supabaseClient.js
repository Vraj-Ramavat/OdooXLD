import { createClient } from '@supabase/supabase-js';
import * as mockData from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Real Supabase client instance (if configured)
export const realSupabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Mock database layer using LocalStorage
class MockDatabase {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    // Helper to get or set initial data
    const getOrSet = (key, initial) => {
      const stored = localStorage.getItem(`gt_${key}`);
      if (!stored) {
        localStorage.setItem(`gt_${key}`, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    };

    // Initialize mock database tables
    getOrSet('profiles', [mockData.MOCK_PROFILE]);
    getOrSet('trips', mockData.MOCK_TRIPS);
    getOrSet('trip_stops', mockData.MOCK_STOPS);
    getOrSet('destinations', mockData.DEFAULT_DESTINATIONS);
    getOrSet('activities', mockData.DEFAULT_ACTIVITIES);
    getOrSet('itinerary_items', mockData.MOCK_ITINERARY);
    getOrSet('expenses', mockData.MOCK_EXPENSES);
    getOrSet('community_trips', mockData.MOCK_COMMUNITY_TRIPS);
    getOrSet('timeline', mockData.MOCK_TIMELINE);
    getOrSet('shared_trips', [
      { id: "share-ee", trip_id: "trip-european-explorer", share_token: "shared-ee-explorer" }
    ]);
    getOrSet('chat_conversations', []);
    getOrSet('chat_messages', []);

    // Active session mock
    const activeUser = localStorage.getItem('gt_active_user');
    if (!activeUser) {
      localStorage.setItem('gt_active_user', JSON.stringify(mockData.MOCK_PROFILE));
    }
  }

  getTable(name) {
    return JSON.parse(localStorage.getItem(`gt_${name}`) || '[]');
  }

  saveTable(name, data) {
    localStorage.setItem(`gt_${name}`, JSON.stringify(data));
  }

  // Auth Operations
  getActiveUser() {
    return JSON.parse(localStorage.getItem('gt_active_user'));
  }

  signIn(email, password) {
    const profiles = this.getTable('profiles');
    // For mock simplicity, let's treat any user password as valid or check email
    let user = profiles.find(p => p.email === email);
    if (!user) {
      // Return a simulated profile based on Alex or create new one
      user = {
        ...mockData.MOCK_PROFILE,
        id: "profile-" + Math.random().toString(36).substring(2, 9),
        full_name: email.split('@')[0],
        email: email
      };
      profiles.push(user);
      this.saveTable('profiles', profiles);
    }
    localStorage.setItem('gt_active_user', JSON.stringify(user));
    return { data: { user }, error: null };
  }

  signUp(email, password, meta) {
    const profiles = this.getTable('profiles');
    const newUser = {
      id: "profile-" + Math.random().toString(36).substring(2, 9),
      full_name: `${meta.firstName || 'Alex'} ${meta.lastName || 'Johnson'}`.trim(),
      avatar_url: meta.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
      country: meta.country || "India",
      bio: meta.bio || "Digital Traveler Passport holder.",
      cities_visited: 0,
      countries_visited: 0,
      days_traveled: 0,
      total_spent: 0,
      email: email,
      phone: meta.phone || "",
      city: meta.city || ""
    };
    profiles.push(newUser);
    this.saveTable('profiles', profiles);
    localStorage.setItem('gt_active_user', JSON.stringify(newUser));
    return { data: { user: newUser }, error: null };
  }

  signOut() {
    localStorage.removeItem('gt_active_user');
    return { error: null };
  }

  updateProfile(userId, data) {
    const profiles = this.getTable('profiles');
    const index = profiles.findIndex(p => p.id === userId);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...data };
      this.saveTable('profiles', profiles);
      
      // Update active user session too
      const active = this.getActiveUser();
      if (active && active.id === userId) {
        localStorage.setItem('gt_active_user', JSON.stringify(profiles[index]));
      }
      return { data: profiles[index], error: null };
    }
    return { data: null, error: 'Profile not found' };
  }

  // Trips Operations
  getTrips(userId) {
    const trips = this.getTable('trips');
    // Filter trips for this user
    const userTrips = trips.filter(t => t.user_id === userId);
    
    // Add dynamically computed fields (cities, duration)
    const stops = this.getTable('trip_stops');
    const dests = this.getTable('destinations');
    
    return userTrips.map(t => {
      const tripStops = stops
        .filter(s => s.trip_id === t.id)
        .sort((a, b) => a.stop_order - b.stop_order);
      
      const cities = tripStops.map(s => {
        const d = dests.find(dest => dest.id === s.destination_id);
        return d ? d.name : '';
      }).filter(Boolean);

      const sDate = new Date(t.start_date);
      const eDate = new Date(t.end_date);
      const diffTime = Math.abs(eDate - sDate);
      const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      return {
        ...t,
        cities,
        duration_days: duration
      };
    });
  }

  getTrip(tripId) {
    const trips = this.getTable('trips');
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;

    const stops = this.getTable('trip_stops');
    const dests = this.getTable('destinations');
    const tripStops = stops
      .filter(s => s.trip_id === trip.id)
      .sort((a, b) => a.stop_order - b.stop_order);
    
    const stopDestinations = tripStops.map(s => {
      const d = dests.find(dest => dest.id === s.destination_id);
      return {
        stop_id: s.id,
        stop_order: s.stop_order,
        ...d
      };
    }).filter(d => d.id);

    const sDate = new Date(trip.start_date);
    const eDate = new Date(trip.end_date);
    const diffTime = Math.abs(eDate - sDate);
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    return {
      ...trip,
      destinations: stopDestinations,
      duration_days: duration
    };
  }

  createTrip(userId, tripData) {
    const trips = this.getTable('trips');
    const newTrip = {
      id: "trip-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      name: tripData.name,
      description: tripData.description || "",
      cover_image: tripData.cover_image || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      budget: Number(tripData.budget || 0),
      currency: tripData.currency || "INR",
      travel_preferences: tripData.travel_preferences || {},
      is_public: false,
      created_at: new Date().toISOString()
    };
    trips.push(newTrip);
    this.saveTable('trips', trips);

    // Save initial stops if provided
    if (tripData.destinations && Array.isArray(tripData.destinations)) {
      tripData.destinations.forEach((destId, index) => {
        this.addTripStop(newTrip.id, destId, index + 1);
      });
    }

    this.addTimelineItem(`You created a new trip`, newTrip.name, "#C94F82");

    return newTrip;
  }

  updateTrip(tripId, tripData) {
    const trips = this.getTable('trips');
    const index = trips.findIndex(t => t.id === tripId);
    if (index !== -1) {
      trips[index] = { ...trips[index], ...tripData };
      this.saveTable('trips', trips);
      return trips[index];
    }
    return null;
  }

  deleteTrip(tripId) {
    const trips = this.getTable('trips');
    const filtered = trips.filter(t => t.id !== tripId);
    this.saveTable('trips', filtered);

    // Cleanup related stops, itinerary items, expenses
    const stops = this.getTable('trip_stops').filter(s => s.trip_id !== tripId);
    this.saveTable('trip_stops', stops);

    const itinerary = this.getTable('itinerary_items').filter(i => i.trip_id !== tripId);
    this.saveTable('itinerary_items', itinerary);

    const expenses = this.getTable('expenses').filter(e => e.trip_id !== tripId);
    this.saveTable('expenses', expenses);

    return true;
  }

  // Trip Stops (Destinations within a trip)
  addTripStop(tripId, destinationId, order) {
    const stops = this.getTable('trip_stops');
    const newStop = {
      id: "stop-" + Math.random().toString(36).substring(2, 9),
      trip_id: tripId,
      destination_id: destinationId,
      stop_order: order,
      created_at: new Date().toISOString()
    };
    stops.push(newStop);
    this.saveTable('trip_stops', stops);
    return newStop;
  }

  updateTripStopsOrder(tripId, stopDestinations) {
    let stops = this.getTable('trip_stops');
    // Remove existing stops for this trip
    stops = stops.filter(s => s.trip_id !== tripId);
    // Add back with new ordering
    stopDestinations.forEach((dest, index) => {
      stops.push({
        id: dest.stop_id || "stop-" + Math.random().toString(36).substring(2, 9),
        trip_id: tripId,
        destination_id: dest.id,
        stop_order: index + 1,
        created_at: new Date().toISOString()
      });
    });
    this.saveTable('trip_stops', stops);
    
    // Log timeline
    const trip = this.getTable('trips').find(t => t.id === tripId);
    if (trip && stopDestinations.length > 0) {
      this.addTimelineItem(`Updated route for your itinerary`, trip.name, "#48B7B0");
    }
  }

  // Itinerary Items
  getItineraryItems(tripId) {
    const items = this.getTable('itinerary_items');
    return items
      .filter(i => i.trip_id === tripId)
      .sort((a, b) => {
        if (a.day_number !== b.day_number) {
          return a.day_number - b.day_number;
        }
        return a.start_time.localeCompare(b.start_time);
      });
  }

  addItineraryItem(tripId, itemData) {
    const items = this.getTable('itinerary_items');
    const newItem = {
      id: "iti-" + Math.random().toString(36).substring(2, 9),
      trip_id: tripId,
      day_number: Number(itemData.day_number || 1),
      start_time: itemData.start_time || "09:00",
      activity_name: itemData.activity_name,
      duration_mins: Number(itemData.duration_mins || 60),
      cost: Number(itemData.cost || 0),
      activity_id: itemData.activity_id || null,
      created_at: new Date().toISOString()
    };
    items.push(newItem);
    this.saveTable('itinerary_items', items);

    // Track activity timeline log
    const trip = this.getTable('trips').find(t => t.id === tripId);
    if (trip) {
      this.addTimelineItem(`Added ${newItem.activity_name} to Day ${newItem.day_number}`, trip.name, "#E6B83D");
      // Add to expenses automatically for syncing
      this.addExpense(tripId, {
        category: 'Activities',
        amount: newItem.cost,
        description: `Activity: ${newItem.activity_name} (Day ${newItem.day_number})`,
        date: this.getTripDayDate(trip.start_date, newItem.day_number)
      });
    }

    return newItem;
  }

  deleteItineraryItem(tripId, itemId) {
    const items = this.getTable('itinerary_items');
    const itemToDelete = items.find(i => i.id === itemId);
    const filtered = items.filter(i => i.id !== itemId);
    this.saveTable('itinerary_items', filtered);

    if (itemToDelete) {
      // Find and delete matching expense
      const expenses = this.getTable('expenses');
      const descMatch = `Activity: ${itemToDelete.activity_name} (Day ${itemToDelete.day_number})`;
      const expFiltered = expenses.filter(e => !(e.trip_id === tripId && e.description === descMatch));
      this.saveTable('expenses', expFiltered);
    }
    return true;
  }

  getTripDayDate(startDateStr, dayNumber) {
    const date = new Date(startDateStr);
    date.setDate(date.getDate() + (dayNumber - 1));
    return date.toISOString().split('T')[0];
  }

  // Expenses
  getExpenses(tripId) {
    const expenses = this.getTable('expenses');
    return expenses.filter(e => e.trip_id === tripId);
  }

  addExpense(tripId, expenseData) {
    const expenses = this.getTable('expenses');
    const newExpense = {
      id: "exp-" + Math.random().toString(36).substring(2, 9),
      trip_id: tripId,
      category: expenseData.category || 'Other',
      amount: Number(expenseData.amount || 0),
      description: expenseData.description || "",
      date: expenseData.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    expenses.push(newExpense);
    this.saveTable('expenses', expenses);
    return newExpense;
  }

  deleteExpense(expenseId) {
    const expenses = this.getTable('expenses');
    const filtered = expenses.filter(e => e.id !== expenseId);
    this.saveTable('expenses', filtered);
    return true;
  }

  // Predefined lists
  getDestinations() {
    return this.getTable('destinations');
  }

  getActivities(destinationId) {
    const acts = this.getTable('activities');
    if (!destinationId) return acts;
    return acts.filter(a => a.destination_id === destinationId);
  }

  // Timeline
  getTimeline() {
    return this.getTable('timeline');
  }

  addTimelineItem(text, tripName, color) {
    const timeline = this.getTable('timeline');
    const newItem = {
      id: "timeline-" + Math.random().toString(36).substring(2, 9),
      text,
      tripName,
      color: color || '#C94F82',
      time: "Just now"
    };
    timeline.unshift(newItem); // Put at start
    this.saveTable('timeline', timeline.slice(0, 10)); // Keep last 10
  }

  // Shared trips & Community
  getCommunityTrips() {
    return this.getTable('community_trips');
  }

  publishTrip(tripId) {
    const trips = this.getTable('trips');
    const tripIndex = trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return null;

    trips[tripIndex].is_public = true;
    this.saveTable('trips', trips);

    const shareToken = "shared-" + Math.random().toString(36).substring(2, 9);
    const shares = this.getTable('shared_trips');
    const newShare = {
      id: "share-" + Math.random().toString(36).substring(2, 9),
      trip_id: tripId,
      share_token: shareToken,
      created_at: new Date().toISOString()
    };
    shares.push(newShare);
    this.saveTable('shared_trips', shares);

    // Also add to community page feed
    const community = this.getTable('community_trips');
    const activeUser = this.getActiveUser();
    const trip = trips[tripIndex];
    
    // Get stops to count cities
    const stops = this.getTable('trip_stops');
    const dests = this.getTable('destinations');
    const tripStops = stops.filter(s => s.trip_id === trip.id).sort((a, b) => a.stop_order - b.stop_order);
    const cities = tripStops.map(s => {
      const d = dests.find(dest => dest.id === s.destination_id);
      return d ? d.name : '';
    }).filter(Boolean);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sD = new Date(trip.start_date);
    const eD = new Date(trip.end_date);
    const dateRangeStr = `${months[sD.getMonth()]} ${sD.getDate()} — ${months[eD.getMonth()]} ${eD.getDate()}, ${sD.getFullYear()}`;

    community.unshift({
      id: "pub-" + Math.random().toString(36).substring(2, 9),
      author: activeUser.full_name,
      author_avatar: activeUser.avatar_url,
      name: trip.name,
      cover_image: trip.cover_image,
      cities: cities,
      dates: dateRangeStr,
      duration: trip.duration_days || 10,
      budget: trip.budget,
      currency: trip.currency,
      likes: 0,
      stops: cities.map(c => ({ name: c, days: 2 }))
    });
    this.saveTable('community_trips', community);

    return shareToken;
  }

  getPublicTrip(shareToken) {
    const shares = this.getTable('shared_trips');
    const share = shares.find(s => s.share_token === shareToken);
    if (!share) {
      // Fallback: check if shareToken matches one of the community trip IDs
      const commTrips = this.getTable('community_trips');
      const comm = commTrips.find(c => c.id === shareToken);
      if (comm) {
        return {
          id: comm.id,
          name: comm.name,
          author: comm.author,
          cover_image: comm.cover_image,
          budget: comm.budget,
          currency: comm.currency,
          cities: comm.cities,
          dates: comm.dates,
          duration_days: comm.duration,
          destinations: comm.stops.map((s, idx) => ({ id: `dest-mock-${idx}`, name: s.name, country: "" })),
          itinerary: []
        };
      }
      return null;
    }
    
    // Load full relational trip
    const trip = this.getTrip(share.trip_id);
    if (!trip) return null;

    const activeUser = this.getActiveUser();
    const profiles = this.getTable('profiles');
    const authorProf = profiles.find(p => p.id === trip.user_id);

    return {
      ...trip,
      author: authorProf ? authorProf.full_name : "Alex Johnson",
      itinerary: this.getItineraryItems(trip.id)
    };
  }

  cloneTrip(sharedTripId, targetUserId) {
    // 1. Get original trip (could be from user trips or public community trip)
    let srcTrip = null;
    let srcStops = [];
    let srcItinerary = [];
    let srcExpenses = [];

    const trips = this.getTable('trips');
    const shares = this.getTable('shared_trips');
    const share = shares.find(s => s.share_token === sharedTripId);
    
    if (share) {
      srcTrip = trips.find(t => t.id === share.trip_id);
      if (srcTrip) {
        srcStops = this.getTable('trip_stops').filter(s => s.trip_id === srcTrip.id);
        srcItinerary = this.getTable('itinerary_items').filter(i => i.trip_id === srcTrip.id);
        srcExpenses = this.getTable('expenses').filter(e => e.trip_id === srcTrip.id);
      }
    } else {
      // Check if it's a community trip ID
      const commTrips = this.getTable('community_trips');
      const comm = commTrips.find(c => c.id === sharedTripId);
      if (comm) {
        // Create matching mock data for community cloning
        srcTrip = {
          name: comm.name,
          description: `Clone of ${comm.name} shared by ${comm.author}.`,
          cover_image: comm.cover_image,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + comm.duration * 24 * 3600 * 1000).toISOString().split('T')[0],
          budget: comm.budget,
          currency: comm.currency,
          travel_preferences: {}
        };
      }
    }

    if (!srcTrip) return null;

    // 2. Insert new trip
    const clonedTripId = "trip-" + Math.random().toString(36).substring(2, 9);
    const newTrip = {
      id: clonedTripId,
      user_id: targetUserId,
      name: `My ${srcTrip.name}`,
      description: srcTrip.description || "",
      cover_image: srcTrip.cover_image,
      start_date: srcTrip.start_date || new Date().toISOString().split('T')[0],
      end_date: srcTrip.end_date || new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
      budget: Number(srcTrip.budget),
      currency: srcTrip.currency || 'INR',
      travel_preferences: srcTrip.travel_preferences || {},
      is_public: false,
      created_at: new Date().toISOString()
    };
    
    trips.push(newTrip);
    this.saveTable('trips', trips);

    // 3. Clone stops
    const stops = this.getTable('trip_stops');
    if (srcStops.length > 0) {
      srcStops.forEach(s => {
        stops.push({
          id: "stop-" + Math.random().toString(36).substring(2, 9),
          trip_id: clonedTripId,
          destination_id: s.destination_id,
          stop_order: s.stop_order,
          created_at: new Date().toISOString()
        });
      });
    } else {
      // Map community stops (cities) to default destinations
      const allDests = this.getTable('destinations');
      const commStops = srcTrip.cities || (sharedTripId.startsWith('pub-') ? this.getTable('community_trips').find(c => c.id === sharedTripId)?.cities : null);
      if (commStops && Array.isArray(commStops)) {
        commStops.forEach((cityName, idx) => {
          const match = allDests.find(d => d.name.toLowerCase() === cityName.toLowerCase());
          if (match) {
            stops.push({
              id: "stop-" + Math.random().toString(36).substring(2, 9),
              trip_id: clonedTripId,
              destination_id: match.id,
              stop_order: idx + 1,
              created_at: new Date().toISOString()
            });
          }
        });
      }
    }
    this.saveTable('trip_stops', stops);

    // 4. Clone itinerary items
    const itinerary = this.getTable('itinerary_items');
    if (srcItinerary.length > 0) {
      srcItinerary.forEach(i => {
        itinerary.push({
          id: "iti-" + Math.random().toString(36).substring(2, 9),
          trip_id: clonedTripId,
          day_number: i.day_number,
          start_time: i.start_time,
          activity_name: i.activity_name,
          duration_mins: i.duration_mins,
          cost: i.cost,
          activity_id: i.activity_id,
          created_at: new Date().toISOString()
        });
      });
    } else {
      // Add a couple of default activities for the day if community clone
      itinerary.push(
        { id: "iti-" + Math.random().toString(36).substring(2, 9), trip_id: clonedTripId, day_number: 1, start_time: "09:00", activity_name: "Hotel Check-in & Coffee", duration_mins: 60, cost: 350 },
        { id: "iti-" + Math.random().toString(36).substring(2, 9), trip_id: clonedTripId, day_number: 1, start_time: "10:30", activity_name: "Discover Main Square & Walking Tour", duration_mins: 120, cost: 0 },
        { id: "iti-" + Math.random().toString(36).substring(2, 9), trip_id: clonedTripId, day_number: 1, start_time: "13:00", activity_name: "Local Food Tasting", duration_mins: 90, cost: 1200 }
      );
    }
    this.saveTable('itinerary_items', itinerary);

    // 5. Clone expenses
    const expenses = this.getTable('expenses');
    if (srcExpenses.length > 0) {
      srcExpenses.forEach(e => {
        expenses.push({
          id: "exp-" + Math.random().toString(36).substring(2, 9),
          trip_id: clonedTripId,
          category: e.category,
          amount: e.amount,
          description: e.description,
          date: e.date,
          created_at: new Date().toISOString()
        });
      });
    } else {
      // Base estimated expenses
      expenses.push(
        { id: "exp-" + Math.random().toString(36).substring(2, 9), trip_id: clonedTripId, category: "Transport", amount: Number(newTrip.budget * 0.4), description: "Cloned trip transport estimate", date: newTrip.start_date },
        { id: "exp-" + Math.random().toString(36).substring(2, 9), trip_id: clonedTripId, category: "Stay", amount: Number(newTrip.budget * 0.35), description: "Cloned trip lodging estimate", date: newTrip.start_date }
      );
    }
    this.saveTable('expenses', expenses);

    this.addTimelineItem(`You cloned a public trip: ${newTrip.name}`, newTrip.name, "#48B7B0");

    return newTrip;
  }
}

export const mockDb = new MockDatabase();

// Centralized Db Client Wrapper
export const db = {
  auth: {
    getUser: async () => {
      if (realSupabase) {
        const { data: { user } } = await realSupabase.auth.getUser();
        return { data: { user }, error: null };
      }
      const user = mockDb.getActiveUser();
      return { data: { user }, error: null };
    },
    signIn: async (email, password) => {
      if (realSupabase) {
        return await realSupabase.auth.signInWithPassword({ email, password });
      }
      return mockDb.signIn(email, password);
    },
    signUp: async (email, password, metadata) => {
      if (realSupabase) {
        return await realSupabase.auth.signUp({
          email,
          password,
          options: { data: metadata }
        });
      }
      return mockDb.signUp(email, password, metadata);
    },
    signOut: async () => {
      if (realSupabase) {
        return await realSupabase.auth.signOut();
      }
      return mockDb.signOut();
    }
  },

  profiles: {
    get: async (userId) => {
      if (realSupabase) {
        return await realSupabase.from('profiles').select('*').eq('id', userId).single();
      }
      const profiles = mockDb.getTable('profiles');
      const profile = profiles.find(p => p.id === userId);
      return { data: profile || null, error: profile ? null : 'Not found' };
    },
    update: async (userId, data) => {
      if (realSupabase) {
        return await realSupabase.from('profiles').update(data).eq('id', userId).select().single();
      }
      return mockDb.updateProfile(userId, data);
    }
  },

  trips: {
    list: async (userId) => {
      if (realSupabase) {
        // Query trips with stops joined
        const { data, error } = await realSupabase
          .from('trips')
          .select('*, trip_stops(*, destinations(*))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) return { data: null, error };
        
        // Map to uniform client model
        const mapped = data.map(t => {
          const sortedStops = (t.trip_stops || []).sort((a, b) => a.stop_order - b.stop_order);
          const cities = sortedStops.map(s => s.destinations?.name).filter(Boolean);
          const sDate = new Date(t.start_date);
          const eDate = new Date(t.end_date);
          const duration = Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) || 1;
          return {
            ...t,
            cities,
            duration_days: duration
          };
        });
        return { data: mapped, error: null };
      }
      return { data: mockDb.getTrips(userId), error: null };
    },
    get: async (tripId) => {
      if (realSupabase) {
        const { data, error } = await realSupabase
          .from('trips')
          .select('*, trip_stops(*, destinations(*))')
          .eq('id', tripId)
          .single();
        
        if (error) return { data: null, error };
        
        const sortedStops = (data.trip_stops || []).sort((a, b) => a.stop_order - b.stop_order);
        const destinations = sortedStops.map(s => ({
          stop_id: s.id,
          stop_order: s.stop_order,
          ...s.destinations
        })).filter(d => d.id);

        const sDate = new Date(data.start_date);
        const eDate = new Date(data.end_date);
        const duration = Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) || 1;

        return {
          data: { ...data, destinations, duration_days: duration },
          error: null
        };
      }
      const trip = mockDb.getTrip(tripId);
      return { data: trip, error: trip ? null : 'Trip not found' };
    },
    create: async (userId, tripData) => {
      if (realSupabase) {
        const { data, error } = await realSupabase
          .from('trips')
          .insert({
            user_id: userId,
            name: tripData.name,
            description: tripData.description,
            cover_image: tripData.cover_image,
            start_date: tripData.start_date,
            end_date: tripData.end_date,
            budget: tripData.budget,
            currency: tripData.currency,
            travel_preferences: tripData.travel_preferences
          })
          .select()
          .single();

        if (error) return { data: null, error };

        // Add stops
        if (tripData.destinations && Array.isArray(tripData.destinations)) {
          const stopsToInsert = tripData.destinations.map((destId, index) => ({
            trip_id: data.id,
            destination_id: destId,
            stop_order: index + 1
          }));
          await realSupabase.from('trip_stops').insert(stopsToInsert);
        }
        return { data, error: null };
      }
      return { data: mockDb.createTrip(userId, tripData), error: null };
    },
    update: async (tripId, tripData) => {
      if (realSupabase) {
        return await realSupabase.from('trips').update(tripData).eq('id', tripId).select().single();
      }
      return { data: mockDb.updateTrip(tripId, tripData), error: null };
    },
    delete: async (tripId) => {
      if (realSupabase) {
        return await realSupabase.from('trips').delete().eq('id', tripId);
      }
      return { data: mockDb.deleteTrip(tripId), error: null };
    },
    updateStopsOrder: async (tripId, stopDestinations) => {
      if (realSupabase) {
        // Delete old stops
        await realSupabase.from('trip_stops').delete().eq('trip_id', tripId);
        // Insert new order
        const stopsToInsert = stopDestinations.map((dest, idx) => ({
          trip_id: tripId,
          destination_id: dest.id,
          stop_order: idx + 1
        }));
        return await realSupabase.from('trip_stops').insert(stopsToInsert);
      }
      mockDb.updateTripStopsOrder(tripId, stopDestinations);
      return { error: null };
    }
  },

  itinerary: {
    list: async (tripId) => {
      if (realSupabase) {
        return await realSupabase
          .from('itinerary_items')
          .select('*')
          .eq('trip_id', tripId)
          .order('day_number')
          .order('start_time');
      }
      return { data: mockDb.getItineraryItems(tripId), error: null };
    },
    add: async (tripId, itemData) => {
      if (realSupabase) {
        return await realSupabase
          .from('itinerary_items')
          .insert({ trip_id: tripId, ...itemData })
          .select()
          .single();
      }
      return { data: mockDb.addItineraryItem(tripId, itemData), error: null };
    },
    delete: async (tripId, itemId) => {
      if (realSupabase) {
        return await realSupabase.from('itinerary_items').delete().eq('id', itemId);
      }
      return { data: mockDb.deleteItineraryItem(tripId, itemId), error: null };
    }
  },

  expenses: {
    list: async (tripId) => {
      if (realSupabase) {
        return await realSupabase.from('expenses').select('*').eq('trip_id', tripId);
      }
      return { data: mockDb.getExpenses(tripId), error: null };
    },
    add: async (tripId, expenseData) => {
      if (realSupabase) {
        return await realSupabase
          .from('expenses')
          .insert({ trip_id: tripId, ...expenseData })
          .select()
          .single();
      }
      return { data: mockDb.addExpense(tripId, expenseData), error: null };
    },
    delete: async (expenseId) => {
      if (realSupabase) {
        return await realSupabase.from('expenses').delete().eq('id', expenseId);
      }
      return { data: mockDb.deleteExpense(expenseId), error: null };
    }
  },

  destinations: {
    list: async () => {
      if (realSupabase) {
        return await realSupabase.from('destinations').select('*');
      }
      return { data: mockDb.getDestinations(), error: null };
    }
  },

  activities: {
    list: async (destinationId = null) => {
      if (realSupabase) {
        let q = realSupabase.from('activities').select('*');
        if (destinationId) q = q.eq('destination_id', destinationId);
        return await q;
      }
      return { data: mockDb.getActivities(destinationId), error: null };
    }
  },

  community: {
    list: async () => {
      // Fetches community trip cards
      if (realSupabase) {
        const { data, error } = await realSupabase
          .from('trips')
          .select('*, profiles(full_name, avatar_url), trip_stops(*, destinations(*))')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        
        if (error) return { data: null, error };

        const mapped = data.map(t => {
          const sortedStops = (t.trip_stops || []).sort((a, b) => a.stop_order - b.stop_order);
          const cities = sortedStops.map(s => s.destinations?.name).filter(Boolean);
          const sDate = new Date(t.start_date);
          const eDate = new Date(t.end_date);
          const duration = Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) || 1;

          return {
            id: t.id,
            author: t.profiles?.full_name || 'Alex Johnson',
            author_avatar: t.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
            name: t.name,
            cover_image: t.cover_image,
            cities: cities,
            dates: `${sDate.toLocaleDateString()} - ${eDate.toLocaleDateString()}`,
            duration: duration,
            budget: t.budget,
            currency: t.currency,
            likes: Math.floor(Math.random() * 50) + 10,
            stops: cities.map(c => ({ name: c, days: 2 }))
          };
        });
        return { data: mapped, error: null };
      }
      return { data: mockDb.getCommunityTrips(), error: null };
    },
    publish: async (tripId) => {
      if (realSupabase) {
        // Set is_public true
        await realSupabase.from('trips').update({ is_public: true }).eq('id', tripId);
        
        // Generate share token
        const shareToken = "shared-" + Math.random().toString(36).substring(2, 9);
        await realSupabase.from('shared_trips').insert({ trip_id: tripId, share_token: shareToken });
        return { data: shareToken, error: null };
      }
      const token = mockDb.publishTrip(tripId);
      return { data: token, error: token ? null : 'Error publishing' };
    },
    getShared: async (shareToken) => {
      if (realSupabase) {
        const { data, error } = await realSupabase
          .from('shared_trips')
          .select('*, trips(*, profiles(*), trip_stops(*, destinations(*)))')
          .eq('share_token', shareToken)
          .single();

        if (error || !data.trips) return { data: null, error: error || 'Shared trip not found' };

        const tripData = data.trips;
        const sortedStops = (tripData.trip_stops || []).sort((a, b) => a.stop_order - b.stop_order);
        const destinations = sortedStops.map(s => ({
          stop_id: s.id,
          stop_order: s.stop_order,
          ...s.destinations
        })).filter(d => d.id);

        const { data: itinerary } = await realSupabase
          .from('itinerary_items')
          .select('*')
          .eq('trip_id', tripData.id)
          .order('day_number')
          .order('start_time');

        return {
          data: {
            ...tripData,
            author: tripData.profiles?.full_name || 'Alex Johnson',
            destinations,
            itinerary: itinerary || []
          },
          error: null
        };
      }
      const trip = mockDb.getPublicTrip(shareToken);
      return { data: trip, error: trip ? null : 'Shared trip not found' };
    },
    clone: async (sharedTripId, targetUserId) => {
      if (realSupabase) {
        // 1. Get original trip details
        const { data: shared } = await realSupabase
          .from('shared_trips')
          .select('*, trips(*)')
          .eq('share_token', sharedTripId)
          .single();
        
        let srcTrip = shared?.trips;
        if (!srcTrip) {
          // Try community id directly
          const { data: direct } = await realSupabase.from('trips').select('*').eq('id', sharedTripId).single();
          srcTrip = direct;
        }

        if (!srcTrip) return { data: null, error: 'Source trip not found' };

        // 2. Insert new trip
        const { data: newTrip, error: tErr } = await realSupabase
          .from('trips')
          .insert({
            user_id: targetUserId,
            name: `My ${srcTrip.name}`,
            description: srcTrip.description,
            cover_image: srcTrip.cover_image,
            start_date: srcTrip.start_date,
            end_date: srcTrip.end_date,
            budget: srcTrip.budget,
            currency: srcTrip.currency,
            travel_preferences: srcTrip.travel_preferences
          })
          .select()
          .single();

        if (tErr) return { data: null, error: tErr };

        // 3. Clone stops
        const { data: stops } = await realSupabase.from('trip_stops').select('*').eq('trip_id', srcTrip.id);
        if (stops && stops.length > 0) {
          const stopsToInsert = stops.map(s => ({
            trip_id: newTrip.id,
            destination_id: s.destination_id,
            stop_order: s.stop_order
          }));
          await realSupabase.from('trip_stops').insert(stopsToInsert);
        }

        // 4. Clone itinerary
        const { data: itinerary } = await realSupabase.from('itinerary_items').select('*').eq('trip_id', srcTrip.id);
        if (itinerary && itinerary.length > 0) {
          const itineraryToInsert = itinerary.map(i => ({
            trip_id: newTrip.id,
            day_number: i.day_number,
            start_time: i.start_time,
            activity_name: i.activity_name,
            duration_mins: i.duration_mins,
            cost: i.cost,
            activity_id: i.activity_id
          }));
          await realSupabase.from('itinerary_items').insert(itineraryToInsert);
        }

        // 5. Clone expenses
        const { data: expenses } = await realSupabase.from('expenses').select('*').eq('trip_id', srcTrip.id);
        if (expenses && expenses.length > 0) {
          const expensesToInsert = expenses.map(e => ({
            trip_id: newTrip.id,
            category: e.category,
            amount: e.amount,
            description: e.description,
            date: e.date
          }));
          await realSupabase.from('expenses').insert(expensesToInsert);
        }

        return { data: newTrip, error: null };
      }
      return { data: mockDb.cloneTrip(sharedTripId, targetUserId), error: null };
    }
  },

  timeline: {
    list: async () => {
      if (realSupabase) {
        // Return standard timeline list, here falling back to mock or select empty
        return { data: mockDb.getTimeline(), error: null };
      }
      return { data: mockDb.getTimeline(), error: null };
    }
  }
};
