-- GlobalTrotter Database Schema

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    country TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TRIPS Table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    travel_preferences JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. DESTINATIONS Table
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT,
    cost_index NUMERIC(3, 1) DEFAULT 1.0, -- Scale e.g. 1 to 5
    popularity NUMERIC(3, 1) DEFAULT 4.0, -- Scale e.g. 1 to 5
    coordinates_lat NUMERIC(9, 6),
    coordinates_lng NUMERIC(9, 6),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TRIP STOPS Table (Relates Trips to Destinations in order)
CREATE TABLE IF NOT EXISTS public.trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(trip_id, stop_order)
);

-- 5. ACTIVITIES Table (Predefined catalog of things to do)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_mins INTEGER DEFAULT 60,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    category TEXT NOT NULL, -- 'Food', 'Culture', 'Nature', 'Adventure', 'Shopping', 'Nightlife'
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. ITINERARY ITEMS Table (Relates activities to stops and days)
CREATE TABLE IF NOT EXISTS public.itinerary_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL, -- 1-indexed day of the trip
    start_time TEXT NOT NULL, -- HH:MM format
    activity_name TEXT NOT NULL,
    duration_mins INTEGER DEFAULT 60,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. EXPENSES Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'Transport', 'Stay', 'Activities', 'Food', 'Other'
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. FAVORITES Table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, destination_id)
);

-- 9. LIKES Table (For sharing community posts)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, trip_id)
);

-- 10. SHARED TRIPS Table
CREATE TABLE IF NOT EXISTS public.shared_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_trips ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);

-- Trips Policies
CREATE POLICY "Users can view their own trips or public trips" ON public.trips FOR SELECT 
USING (true);
CREATE POLICY "Users can create their own trips" ON public.trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own trips" ON public.trips FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own trips" ON public.trips FOR DELETE USING (true);

-- Trip Stops Policies
CREATE POLICY "Users can view stops for trips they can view" ON public.trip_stops FOR SELECT 
USING (true);
CREATE POLICY "Users can manage stops for their own trips" ON public.trip_stops FOR ALL
USING (true);

-- Destinations Policies (Read-only for all, write restricted)
CREATE POLICY "Everyone can view destinations" ON public.destinations FOR SELECT USING (true);

-- Activities Policies (Read-only for all)
CREATE POLICY "Everyone can view activities" ON public.activities FOR SELECT USING (true);

-- Itinerary Items Policies
CREATE POLICY "Users can view itinerary items for accessible trips" ON public.itinerary_items FOR SELECT 
USING (true);
CREATE POLICY "Users can manage itinerary items for their own trips" ON public.itinerary_items FOR ALL
USING (true);

-- Expenses Policies
CREATE POLICY "Users can view expenses for their own trips" ON public.expenses FOR SELECT 
USING (true);
CREATE POLICY "Users can manage expenses for their own trips" ON public.expenses FOR ALL
USING (true);

-- Favorites Policies
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (true);

-- Likes Policies
CREATE POLICY "Everyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON public.likes FOR ALL USING (true);

-- Shared Trips Policies
CREATE POLICY "Everyone can view shared trips" ON public.shared_trips FOR SELECT USING (true);
CREATE POLICY "Users can manage shared entries for their own trips" ON public.shared_trips FOR ALL
USING (true);

-- Chat Conversations Table
CREATE TABLE public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chat Messages Table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'assistant')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chat Policies
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Users can manage their own conversations" ON public.chat_conversations FOR ALL USING (true);

CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can manage messages in their conversations" ON public.chat_messages FOR ALL USING (true);
